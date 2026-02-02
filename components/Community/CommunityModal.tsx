"use client";

import { X, Play } from "lucide-react";
import Image from "next/image";
import { CommunityPost } from "./mockPosts";

interface CommunityModalProps {
    post: CommunityPost | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function CommunityModal({ post, isOpen, onClose }: CommunityModalProps) {
    if (!isOpen || !post) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Dark Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal Content */}
            <div
                className="relative z-10 w-full max-w-lg md:max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                {/* Media Container */}
                <div className="relative w-full aspect-square bg-neutral-100">
                    {post.type === "image" ? (
                        <Image
                            src={post.media}
                            alt={post.caption}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <video
                            src={post.media}
                            controls
                            autoPlay
                            className="w-full h-full object-cover"
                        >
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>

                {/* Caption */}
                <div className="p-5">
                    <p className="text-neutral-700 text-sm md:text-base leading-relaxed">
                        {post.caption}
                    </p>
                </div>
            </div>
        </div>
    );
}
