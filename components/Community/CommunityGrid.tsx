"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Mail, ArrowRight, Instagram } from "lucide-react";
import { mockPosts, CommunityPost } from "./mockPosts";
import CommunityModal from "./CommunityModal";

const displayedPosts = mockPosts.slice(0, 8);

export default function CommunityGrid() {
    const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activePostId, setActivePostId] = useState<string | null>(null);

    const selectedPost = selectedPostIndex !== null ? displayedPosts[selectedPostIndex] : null;

    const handlePostClick = (post: CommunityPost, index: number) => {
        // On mobile: first tap shows overlay, second tap opens modal
        // On desktop: always open modal (hover handles overlay)
        if (activePostId === post.id) {
            // Second tap - open modal
            setSelectedPostIndex(index);
            setIsModalOpen(true);
            setActivePostId(null);
        } else {
            // First tap - show overlay
            setActivePostId(post.id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPostIndex(null);
    };

    const handlePrevious = () => {
        if (selectedPostIndex !== null && selectedPostIndex > 0) {
            setSelectedPostIndex(selectedPostIndex - 1);
        }
    };

    const handleNext = () => {
        if (selectedPostIndex !== null && selectedPostIndex < displayedPosts.length - 1) {
            setSelectedPostIndex(selectedPostIndex + 1);
        }
    };

    return (
        <section className="w-full py-12 md:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-8">
                    <Mail className="w-8 h-8 text-[#5B3A82] mb-4 stroke-[1.5]" />
                    <h2 className="text-3xl md:text-4xl font-normal text-[#5B3A82] mb-8">
                        Join Our Community
                    </h2>

                    {/* Newsletter Form */}
                    <div className="w-full max-w-xl space-y-4 mb-12">
                        <input
                            type="email"
                            placeholder="E-mail"
                            className="w-full px-6 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-[#5B3A82] text-gray-600 placeholder:text-gray-400"
                        />
                        <button className="w-full bg-[#5B3A82] text-white rounded-full py-3 px-6 flex items-center justify-center gap-2 hover:bg-[#4a2e6b] transition-colors group">
                            <span>Join</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Grid - Fluidly Responsive */}
                <div className="grid grid-cols-4 gap-2 md:gap-4 mb-8 mx-auto w-full max-w-[340px] md:max-w-[1320px]">
                    {displayedPosts.map((post, index) => {
                        const isActive = activePostId === post.id;
                        return (
                            <button
                                key={post.id}
                                onClick={() => handlePostClick(post, index)}
                                className="relative w-full aspect-[4/5] rounded-lg overflow-hidden group cursor-pointer focus:outline-none"
                            >
                                {/* Cover Image */}
                                <Image
                                    src={post.cover}
                                    alt={post.caption}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                />

                                {/* Hover/Active Overlay with Icon */}
                                <div className={`absolute inset-0 flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-[#5B3A82]/40' : 'bg-[#5B3A82]/0 md:group-hover:bg-[#5B3A82]/40'}`}>
                                    {post.type === "video" ? (
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white flex items-center justify-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}>
                                            <Play size={20} className="text-white ml-0.5" fill="currentColor" />
                                        </div>
                                    ) : (
                                        <Instagram size={24} className={`text-white transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`} strokeWidth={1.5} />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Instagram Handle */}
                <div className="text-center">
                    <a
                        href="https://instagram.com/l_c_organic"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                    >
                        <span className="text-lg text-[#5B3A82] hover:text-[#4a2e6b] border-b border-[#C8A2C8] pb-0.5">
                            @l_c_organic
                        </span>
                    </a>
                </div>
            </div>

            {/* Modal */}
            <CommunityModal
                post={selectedPost}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onPrevious={selectedPostIndex !== null && selectedPostIndex > 0 ? handlePrevious : undefined}
                onNext={selectedPostIndex !== null && selectedPostIndex < displayedPosts.length - 1 ? handleNext : undefined}
            />
        </section>
    );
}
