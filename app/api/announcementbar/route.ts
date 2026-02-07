import { NextResponse } from 'next/server';
import { getDb } from '@/libs/mongodb';

export const revalidate = 0; // Don't cache for now (or set a small revalidation time)

export async function GET() {
    try {
        const db = await getDb();
        const collection = db.collection('AnnouncementBar');

        // Get the most recently updated announcement bar configuration
        const announcementBar = await collection.findOne(
            {},
            { sort: { updatedAt: -1 } }
        );

        if (!announcementBar) {
            return NextResponse.json({ texts: [] });
        }

        return NextResponse.json({ texts: announcementBar.texts || [] });
    } catch (error) {
        console.error('Error fetching announcement bar:', error);
        return NextResponse.json(
            { error: 'Failed to fetch announcement bar' },
            { status: 500 }
        );
    }
}
