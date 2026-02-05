"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ANNOUNCEMENTS = [
    "NEW ARRIVALS JUST LANDED",
    "FREE SHIPPING ON ALL ORDERS",
    "SHOP OUR WINTER COLLECTION",
];

interface AnnouncementBarProps {
    scrolled?: boolean;
}

export default function AnnouncementBar({ scrolled = false }: AnnouncementBarProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
    };

    return (
        <div className={`transition-colors duration-300 w-full relative z-[60] border-b ${scrolled
            ? "bg-[#F4F4F0] border-neutral-200/50"
            : "bg-transparent border-white/10"
            }`}>
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
                            {ANNOUNCEMENTS[currentIndex]}
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
