import { NextResponse } from 'next/server';
import { getDb } from '@/libs/mongodb';

export const revalidate = 10;

export async function GET() {
    try {
        const db = await getDb();
        const collection = db.collection('Instagram');

        // Fetch the first Instagram document (assuming single account)
        const instagram = await collection.findOne({});

        if (!instagram) {
            return NextResponse.json(
                { error: 'No Instagram data found' },
                { status: 404 }
            );
        }

        // Transform the data to match the component interface
        const transformedData = {
            id: instagram._id.toString(),
            logo: instagram.logo,
            accountName: instagram.accountname,
            posts: instagram.posts.map((post: any, index: number) => {
                // Detect if content is a video based on file extension
                const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(post.content);

                return {
                    id: `${instagram._id.toString()}-${index}`,
                    cover: post.coverimage,
                    type: isVideo ? 'video' : 'image',
                    media: post.content,
                    caption: post.description,
                };
            }),
            createdAt: instagram.createdAt,
            updatedAt: instagram.updatedAt,
        };

        return NextResponse.json(transformedData);
    } catch (error) {
        console.error('Error fetching Instagram data:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch Instagram data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
