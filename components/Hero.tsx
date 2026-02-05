"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Pause, Play } from "lucide-react";

interface HeroImage {
  id: string;
  image: string;
  createdAt: string;
}

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await fetch('/api/hero');
        if (response.ok) {
          const data = await response.json();
          setHeroImages(data);
        } else {
          console.error('Failed to fetch hero images');
        }
      } catch (error) {
        console.error('Error fetching hero images:', error);
      }
    };

    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (heroImages.length > 0 && isPlaying) {
      const id = setInterval(() => {
        setCurrent((c) => (c + 1) % heroImages.length);
      }, 6000);
      return () => clearInterval(id);
    }
  }, [heroImages.length, isPlaying]);

  const images = useMemo(() => {
    return heroImages.map(hero => hero.image);
  }, [heroImages]);

  // Show fallback if no images
  if (images.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative flex min-h-[100svh] items-end justify-center md:justify-start overflow-hidden bg-neutral-900">
      {/* Background Slideshow - Clean Single Layer */}
      <motion.div style={{ scale: bgScale }} className="absolute inset-0 z-0">
        {images.map((src, idx) => (
          <motion.div
            key={src}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: idx === current ? 1 : 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <Image
              src={src}
              alt="LC Organic Winter Collection"
              fill
              priority={idx < 2}
              loading={idx < 2 ? undefined : "lazy"}
              unoptimized={src.startsWith('http')}
              sizes="100vw"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Very subtle dark overlay for minimal text protection */}
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>
        ))}
      </motion.div>

      {/* Content Overlay - Aligned to Bottom Left on Desktop */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 md:px-12 pb-24 md:pb-32 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <h1
            className="text-[17px] xs:text-[19px] sm:text-3xl md:text-5xl lg:text-6xl font-montserrat tracking-tight leading-tight text-white whitespace-nowrap"
            style={{
              fontWeight: 500,
              textShadow: "0 2px 10px rgba(0,0,0,0.3)"
            }}
          >
            Lock in moisture, lock out the frost
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <Link
            href="/category/all"
            className="inline-flex items-center justify-center rounded-full px-6 py-2.5 sm:px-8 sm:py-4 text-[13px] sm:text-base font-normal text-white transition-all duration-300 hover:scale-105 hover:bg-[#4a2e6b]"
            style={{
              backgroundColor: "#5B3A82",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }}
          >
            Shop Your Winter Hair Essentials
          </Link>
        </motion.div>
      </div>

      {/* Hero Indicators (Bottom Right) */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
        {/* Dots */}
        <div className="flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 w-2 rounded-full transition-all duration-300 shadow-sm ${idx === current ? "bg-white w-6" : "bg-white/50 hover:bg-white"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="ml-2 text-white/70 hover:text-white transition-colors"
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
    </section>
  );
}
