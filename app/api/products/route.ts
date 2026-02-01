import { NextResponse } from 'next/server';
import { getDb } from '@/libs/mongodb';
import { isSaleActive, getDisplayPrice } from '@/libs/productUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');

    const db = await getDb();
    const collection = db.collection('Product');

    // Build query
    const query: any = {};
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const products = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Transform products to match expected format
    const transformedProducts = products.map((product: any) => {
      // Use first image from images array, or fallback
      const productImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : '/placeholder.svg';
      
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

      return {
        id: product._id.toString(),
        name: product.title,
        price: displayPrice,
        originalPrice: product.price,
        salePrice: product.salePrice,
        enableSale: saleActive, // Return effective sale status (false if expired)
        image: productImage,
        images: product.images || [],
        slug: product.slug,
        description: product.description || '',
        stock: product.stock,
      };
    });

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}



