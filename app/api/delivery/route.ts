import { NextResponse } from 'next/server';
import { getDb } from '@/libs/mongodb';

export const revalidate = 10;

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection('Delivery');
    
    const deliveries = await collection
      .find({})
      .sort({ governorate: 1 })
      .toArray();

    const transformedDeliveries = deliveries.map((delivery: any) => ({
      id: delivery._id.toString(),
      governorate: delivery.governorate,
      price: delivery.price,
    }));

    return NextResponse.json(transformedDeliveries);
  } catch (error) {
    console.error('Error fetching delivery prices:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch delivery prices', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}




