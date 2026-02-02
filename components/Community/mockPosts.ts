// Mock data for Community posts
// This structure is designed to be easily replaced with MongoDB data later

export interface CommunityPost {
    id: string;
    cover: string;        // Cover image URL (used in grid)
    type: "image" | "video";
    media: string;        // Full image or video URL
    caption: string;
}

export const mockPosts: CommunityPost[] = [
    {
        id: "1",
        cover: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
        type: "image",
        media: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
        caption: "Beautiful hair transformation ✨ Our signature treatment brings out your natural shine!"
    },
    {
        id: "2",
        cover: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
        type: "image",
        media: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
        caption: "Healthy hair starts with the right care routine 💜"
    },
    {
        id: "3",
        cover: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop",
        type: "video",
        media: "https://www.w3schools.com/html/mov_bbb.mp4",
        caption: "Watch our quick styling tutorial! 🎬"
    },
    {
        id: "4",
        cover: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop",
        type: "image",
        media: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
        caption: "Self-care Sunday essentials 🌿"
    },
    {
        id: "5",
        cover: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop",
        type: "image",
        media: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800",
        caption: "Curls looking absolutely gorgeous! 💫"
    },
    {
        id: "6",
        cover: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop",
        type: "video",
        media: "https://www.w3schools.com/html/mov_bbb.mp4",
        caption: "Behind the scenes of our latest photoshoot 📸"
    },
    {
        id: "7",
        cover: "https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=400&h=400&fit=crop",
        type: "image",
        media: "https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=800",
        caption: "Smooth, silky, stunning ✨"
    },
    {
        id: "8",
        cover: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=400&fit=crop",
        type: "image",
        media: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800",
        caption: "Natural beauty, enhanced 🌸"
    },
    {
        id: "9",
        cover: "https://images.unsplash.com/photo-1605980776566-0486c3b394f2?w=400&h=400&fit=crop",
        type: "image",
        media: "https://images.unsplash.com/photo-1605980776566-0486c3b394f2?w=800",
        caption: "Your hair journey starts here 💜"
    },
];
