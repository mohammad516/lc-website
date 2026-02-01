import { NextResponse } from 'next/server';
import { getDb } from '@/libs/mongodb';
import { isSaleActive, getDisplayPrice } from '@/libs/productUtils';

export const revalidate = 10;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = await getDb();
    const collection = db.collection('Product');
    
    const product = await collection.findOne({ slug });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if sale is still active (not expired)
    const saleActive = isSaleActive({
      enableSale: product.enableSale,
      salePrice: product.salePrice,
      saleEndDate: product.saleEndDate,
    });

    // Get display price (salePrice if active, otherwise regular price)
    const displayPrice = getDisplayPrice({
      price: product.price,
      enableSale: product.enableSale,
      salePrice: product.salePrice,
      saleEndDate: product.saleEndDate,
    });

    // Transform to match expected format
    const transformedProduct = {
      id: product._id.toString(),
      sku: product.slug.toUpperCase().replace(/-/g, '-') || `PROD-${product._id.toString().slice(-6)}`,
      title: product.title,
      price: displayPrice,
      originalPrice: product.price,
      salePrice: product.salePrice,
      enableSale: saleActive, // Return effective sale status (false if expired)
      description: product.description || '',
      images: product.images || [],
      image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg',
      options: product.length && product.length.length > 0 
        ? { length: product.length } 
        : undefined,
      stock: product.stock,
      slug: product.slug,
      category: product.category,
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch product', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}



