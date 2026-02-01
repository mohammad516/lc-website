import { NextResponse } from 'next/server';
import { getDb } from '@/libs/mongodb';

export const revalidate = 10;

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection('Hero');
    
    const heroes = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const transformedHeroes = heroes.map((hero: any) => ({
      id: hero._id.toString(),
      image: hero.image,
      createdAt: hero.createdAt,
    }));

    return NextResponse.json(transformedHeroes);
  } catch (error) {
    console.error('Error fetching heroes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch heroes', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}




