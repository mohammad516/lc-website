import { NextResponse } from 'next/server';
import { getDb } from '@/libs/mongodb';

export const revalidate = 10;

export async function GET() {
    try {
        const db = await getDb();
        const collection = db.collection('Shopnow');

        // Fetch the first Shopnow document
        const shopnow = await collection.findOne({});

        if (!shopnow) {
            return NextResponse.json(
                { error: 'No Shopnow data found' },
                { status: 404 }
            );
        }

        const transformedData = {
            id: shopnow._id.toString(),
            image: shopnow.image,
            description: shopnow.description,
            createdAt: shopnow.createdAt,
            updatedAt: shopnow.updatedAt,
        };

        return NextResponse.json(transformedData);
    } catch (error) {
        console.error('Error fetching Shopnow data:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch Shopnow data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
