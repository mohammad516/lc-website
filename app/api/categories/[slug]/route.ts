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
    const collection = db.collection('LcOrganicCategory');
    
    // Convert slug to category name format (e.g., "necklaces" -> "Necklaces")
    const categoryName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Try to find by exact name match first
    let category = await collection.findOne({ name: categoryName });
    
    // If not found, try case-insensitive search
    if (!category) {
      const allCategories = await collection.find({}).toArray();
      category = allCategories.find((cat: any) => 
        cat.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get products for this category
    const productsCollection = db.collection('Product');
    
    // Match products by category name (Product.category is a String matching LcOrganicCategory.name)
    const products = await productsCollection
      .find({ category: category.name })
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
        title: product.title,
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

    // Transform to match expected format
    const transformedCategory = {
      id: category._id.toString(),
      name: category.name,
      title: category.name.toUpperCase(),
      description: category.description || '',
      image: category.image,
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      products: transformedProducts,
    };

    return NextResponse.json(transformedCategory);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch category', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

