"use client";

import { useState, useRef } from "react";
import { X, Volume2, VolumeX, Pause, Play, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CommunityPost } from "./mockPosts";
import { useCart } from "@/contexts/CartContext";

interface CommunityModalProps {
    post: CommunityPost | null;
    isOpen: boolean;
    onClose: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    accountName?: string;
    logo?: string;
}

export default function CommunityModal({ post, isOpen, onClose, onPrevious, onNext, accountName, logo }: CommunityModalProps) {
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { cartCount } = useCart();
    const [isExpanded, setIsExpanded] = useState(false);

    // Reset expanded state when post changes
    useState(() => {
        setIsExpanded(false);
    });

    if (!isOpen || !post) return null;

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const MAX_LENGTH = 120;
    const isLongText = post.caption.length > MAX_LENGTH;
    const displayedCaption = isExpanded || !isLongText ? post.caption : post.caption.slice(0, MAX_LENGTH) + "...";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white md:bg-black/80 md:backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div
                className="relative z-10 w-full h-full md:h-auto md:max-w-md bg-white md:rounded-2xl overflow-y-auto shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    {/* Profile Image - Circular placeholder */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 p-[2px]">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white">
                            <Image
                                src={logo || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"}
                                alt="Profile"
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <span className="font-medium text-neutral-800">{accountName || 'l_c_organic'}</span>
                </div>

                {/* Media Container - object-contain on mobile to prevent cropping */}
                <div className="relative w-full flex-1 md:aspect-[4/5] bg-black flex items-center justify-center">
                    {post.type === "image" ? (
                        <Image
                            src={post.media}
                            alt={post.caption}
                            fill
                            className="object-contain md:object-cover"
                        />
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                src={post.media}
                                autoPlay
                                loop
                                muted={isMuted}
                                playsInline
                                className="w-full h-full object-contain md:object-cover"
                            >
                                Your browser does not support the video tag.
                            </video>

                            {/* Video Controls - Only for videos */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <button
                                    onClick={toggleMute}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                    aria-label={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                                <button
                                    onClick={togglePlay}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                    aria-label={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Caption */}
                <div className="p-4 bg-white">
                    <p className="text-neutral-700 text-sm leading-relaxed">
                        {displayedCaption}
                        {isLongText && !isExpanded && (
                            <button
                                onClick={() => setIsExpanded(true)}
                                className="ml-1 text-neutral-500 font-medium hover:text-[#5B3A82]"
                            >
                                more
                            </button>
                        )}
                    </p>
                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={24} className="text-neutral-600" />
                    </button>

                    {/* Cart Link */}
                    <Link href="/cart" className="flex items-center gap-1 text-neutral-500 hover:text-[#5B3A82] transition-colors">
                        <ShoppingBag size={18} />
                        <span className="text-sm">{cartCount}</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onPrevious}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30"
                            aria-label="Previous"
                            disabled={!onPrevious}
                        >
                            <ChevronLeft size={24} className="text-neutral-600" />
                        </button>
                        <button
                            onClick={onNext}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30"
                            aria-label="Next"
                            disabled={!onNext}
                        >
                            <ChevronRight size={24} className="text-neutral-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
