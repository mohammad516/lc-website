import { NextResponse } from 'next/server';
import { getDb } from '@/libs/mongodb';

export const revalidate = 10;

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection('LcOrganicCategory');
    
    const categories = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const transformedCategories = categories.map((category: any) => ({
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      image: category.image,
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: category.createdAt,
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}




