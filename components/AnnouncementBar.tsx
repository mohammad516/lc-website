"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_ANNOUNCEMENTS = [
    "NEW ARRIVALS JUST LANDED",
    "FREE SHIPPING ON ALL ORDERS",
    "SHOP OUR WINTER COLLECTION",
];

interface AnnouncementBarProps {
    scrolled?: boolean;
}

export default function AnnouncementBar({ scrolled = false }: AnnouncementBarProps) {
    const [announcements, setAnnouncements] = useState<string[]>(DEFAULT_ANNOUNCEMENTS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch announcements from API
    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await fetch('/api/announcementbar');
                if (response.ok) {
                    const data = await response.json();
                    if (data.texts && data.texts.length > 0) {
                        setAnnouncements(data.texts);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, [announcements.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
    }, [announcements.length]);

    // Auto-cycle announcements
    useEffect(() => {
        if (isHovered || announcements.length <= 1) return;

        const interval = setInterval(() => {
            handleNext();
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, [isHovered, announcements.length, handleNext]);

    if (loading && announcements.length === 0) return null;

    return (
        <div
            className={`transition-colors duration-300 w-full relative z-[60] border-b ${scrolled
                ? "bg-[#F4F4F0] border-neutral-200/50"
                : "bg-transparent border-white/10"
                }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-between">
                {/* Left Arrow */}
                <button
                    onClick={handlePrev}
                    className={`p-2 transition-colors ${scrolled
                        ? "text-neutral-500 hover:text-[#0E4D5D]"
                        : "text-white/70 hover:text-white"
                        }`}
                    aria-label="Previous announcement"
                >
                    <ChevronLeft size={16} strokeWidth={1.5} />
                </button>

                {/* Text Content */}
                <div className="flex-1 overflow-hidden relative h-full flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentIndex}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                            className={`text-[11px] sm:text-[12px] tracking-[0.2em] uppercase text-center truncate px-4 font-namdhinggo transition-colors duration-300 ${scrolled ? "text-[#0E4D5D]" : "text-white"
                                }`}
                        >
                            {announcements[currentIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Right Arrow */}
                <button
                    onClick={handleNext}
                    className={`p-2 transition-colors ${scrolled
                        ? "text-neutral-500 hover:text-[#0E4D5D]"
                        : "text-white/70 hover:text-white"
                        }`}
                    aria-label="Next announcement"
                >
                    <ChevronRight size={16} strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}
