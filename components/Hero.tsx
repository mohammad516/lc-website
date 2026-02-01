"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

interface HeroImage {
  id: string;
  image: string;
  createdAt: string;
}

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 } },
  } as const;
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  } as const;

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
    if (heroImages.length > 0) {
      const id = setInterval(() => {
        setCurrent((c) => (c + 1) % heroImages.length);
      }, 6000);
      return () => clearInterval(id);
    }
  }, [heroImages.length]);

  const images = useMemo(() => {
    return heroImages.map(hero => hero.image);
  }, [heroImages]);

  // Get current and next image for split screen (desktop only)
  const nextIndex = images.length > 1 ? (current + 1) % images.length : current;

  // Show fallback if no images
  if (images.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative flex min-h-[90vh] sm:min-h-[100svh] items-center justify-center overflow-hidden">
      {/* Mobile: Background slideshow with crossfade and subtle parallax scale */}
      <motion.div style={{ scale: bgScale }} className="absolute inset-0 lg:hidden">
        {images.map((src, idx) => (
          <motion.div
            key={src}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: idx === current ? 1 : 0, scale: idx === current ? 1 : 1.02 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ willChange: 'opacity, transform' }}
          >
            <Image
              src={src}
              alt="LC Organic Skin Care"
              fill
              priority={idx < 2}
              loading={idx < 2 ? undefined : "lazy"}
              unoptimized={src.startsWith('http')}
              sizes="100vw"
              className="absolute inset-0 h-full w-full object-cover object-[50%_25%]"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Desktop: Split screen with crossfade transition like mobile */}
      <div className="absolute inset-0 hidden lg:flex">
        {/* Left Image Panel - crossfade */}
        <div className="relative w-1/2 h-full overflow-hidden">
          {images.map((src, idx) => (
            <motion.div
              key={`left-${src}`}
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: idx === current ? 1 : 0,
                scale: idx === current ? 1 : 1.02
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ willChange: 'opacity, transform' }}
            >
              <Image
                src={src}
                alt="LC Organic Skin Care"
                fill
                priority={idx < 2}
                loading={idx < 2 ? undefined : "lazy"}
                unoptimized={src.startsWith('http')}
                sizes="50vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </motion.div>
          ))}
        </div>

        {/* Right Image Panel - crossfade (shows next image) */}
        <div className="relative w-1/2 h-full overflow-hidden">
          {images.map((src, idx) => {
            const nextIdx = (idx + 1) % images.length;
            return (
              <motion.div
                key={`right-${src}`}
                className="absolute inset-0"
                initial={false}
                animate={{
                  opacity: idx === current ? 1 : 0,
                  scale: idx === current ? 1 : 1.02
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ willChange: 'opacity, transform' }}
              >
                <Image
                  src={images[nextIdx]}
                  alt="LC Organic Skin Care"
                  fill
                  priority={idx < 2}
                  loading={idx < 2 ? undefined : "lazy"}
                  unoptimized={images[nextIdx]?.startsWith('http')}
                  sizes="50vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Animated gradient overlay with color accents */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#5B3A82]/10 via-transparent to-[#5B3A82]/10"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ willChange: 'opacity' }}
      />

      {/* Floating particles effect - reduced on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { width: 150, height: 150, left: 10, top: 20, x: 5, duration: 3.5, delay: 0 },
          { width: 200, height: 180, left: 50, top: 40, x: -8, duration: 4, delay: 0.5 },
          { width: 120, height: 160, left: 80, top: 60, x: 10, duration: 3.8, delay: 1 },
          { width: 180, height: 200, left: 20, top: 70, x: -5, duration: 4.2, delay: 1.5 },
        ].map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#5B3A82]/20 to-[#5B3A82]/20 blur-xl hidden sm:block"
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              willChange: 'transform, opacity',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, particle.x, 0],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
        {/* Simplified particles for mobile - reduced to 2 */}
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={`mobile-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-[#5B3A82]/15 to-[#5B3A82]/15 blur-lg sm:hidden"
            style={{
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
              willChange: 'transform, opacity',
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center text-white">
        {/* Enhanced gradient backdrop with glow effect - optimized for mobile */}
        <motion.div
          className="absolute left-1/2 top-1/2 z-[-1] h-[75%] sm:h-[80%] w-[100%] sm:w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-transparent via-transparent to-transparent blur-xl sm:blur-2xl"
          animate={{
            scale: [1, 1.03, 1],
            opacity: [0.7, 0.85, 0.7],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ willChange: 'transform, opacity' }}
        />
        <div className="absolute left-1/2 top-1/2 z-[-1] h-[75%] sm:h-[80%] w-[100%] sm:w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#5B3A82]/8 via-[#5B3A82]/8 to-[#5B3A82]/8 sm:from-[#5B3A82]/5 sm:via-[#5B3A82]/5 sm:to-[#5B3A82]/5 blur-2xl sm:blur-3xl" />

        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <motion.div
            variants={itemVariants}
            className="text-xs sm:text-sm md:text-lg uppercase tracking-[0.15em] sm:tracking-[0.2em] font-light text-white/90 mb-2 sm:mb-3"
            style={{
              textShadow: "0 2px 15px rgba(0,0,0,0.6), 0 0 25px rgba(8,217,214,0.4)",
              letterSpacing: "0.2em"
            }}
          >
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Welcome To
            </motion.span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-1 sm:mt-2 text-5xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight relative px-2 sm:px-0"
            style={{
              textShadow: "0 4px 25px rgba(0,0,0,0.8), 0 0 50px rgba(8,217,214,0.6), 0 0 70px rgba(255,46,99,0.5)",
              lineHeight: "1.1"
            }}
          >
            <motion.span
              className="block text-white"
              animate={{
                color: ["#FFFFFF", "#E0B0FF", "#FFFFFF"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              LC ORGANIC
            </motion.span>
            {/* Glow effect behind text - enhanced on mobile */}
            <motion.div
              className="absolute inset-0 blur-2xl sm:blur-3xl bg-gradient-to-r from-[#5B3A82]/40 via-[#5B3A82]/40 to-[#5B3A82]/40 sm:from-[#5B3A82]/40 sm:via-[#5B3A82]/40 sm:to-[#5B3A82]/40 -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ willChange: 'transform, opacity' }}
            />
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed tracking-wide font-light flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-2"
            style={{
              textShadow: "0 2px 15px rgba(0,0,0,0.6), 0 0 30px rgba(255,255,255,0.25)"
            }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Where Beauty
            </motion.span>
            <motion.span
              className="font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              Finds Its Way
            </motion.span>
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="mt-6 sm:mt-12 flex flex-col items-center justify-center gap-3 sm:gap-5 sm:flex-row w-full sm:w-auto px-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.a
              href="https://wa.me/96170717397?text=Hello%2C%20I%20would%20like%20to%20contact%20you"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact Us on WhatsApp"
              className="group relative inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-gradient-to-r from-[#5B3A82] to-[#5B3A82] px-4 sm:px-8 py-2.5 sm:py-4 text-xs sm:text-base font-semibold text-white overflow-hidden min-h-[40px] sm:min-h-[56px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                boxShadow: "0 6px 25px rgba(8,217,214,0.5), 0 0 40px rgba(255,46,99,0.4), inset 0 0 15px rgba(255,255,255,0.15)"
              }}
            >
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#5B3A82] to-[#5B3A82] opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2 translate-x-2 sm:translate-x-0">
                Contact Us
                <motion.svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full"
                transition={{ duration: 0.6 }}
              />
            </motion.a>

            <motion.a
              href="#categories"
              aria-label="View Products"
              onClick={(e) => {
                e.preventDefault();
                const categoriesSection = document.getElementById('categories');
                if (categoriesSection) {
                  categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="group relative inline-flex w-full sm:w-auto items-center justify-center rounded-full border-2 border-white/90 backdrop-blur-sm px-4 sm:px-8 py-2.5 sm:py-4 text-xs sm:text-base font-semibold text-white overflow-hidden min-h-[40px] sm:min-h-[56px]"
              whileHover={{ scale: 1.05, borderColor: "#5B3A82" }}
              whileTap={{ scale: 0.95 }}
              style={{
                boxShadow: "0 5px 20px rgba(0,0,0,0.4), inset 0 0 15px rgba(255,255,255,0.08)"
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">View Products</span>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Scroll indicator - optimized for mobile */}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-1/2 z-10 -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="relative">
          <div className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full border-2 border-white/80 backdrop-blur-sm flex items-center justify-center bg-white/10">
            <motion.svg
              viewBox="0 0 24 24"
              className="h-5 w-5 sm:h-6 sm:w-6 text-white"
              aria-hidden="true"
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <path fill="currentColor" d="M12 16.5c-.26 0-.51-.1-.71-.29l-5-5a1.003 1.003 0 0 1 1.42-1.42L12 13.59l4.29-4.3a1.003 1.003 0 0 1 1.42 1.42l-5 5c-.2.19-.45.29-.71.29Z" />
            </motion.svg>
          </div>
          {/* Pulsing ring - smaller on mobile */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#5B3A82]/50"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </div>
      </motion.div>

      {/* Enhanced Carousel indicator dots - optimized for mobile */}
      <div className="absolute bottom-16 sm:bottom-20 left-1/2 z-10 -translate-x-1/2 flex gap-2 sm:gap-3 items-center">
        {images.map((_, idx) => (
          <motion.button
            key={idx}
            className="relative group touch-manipulation"
            onClick={() => setCurrent(idx)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to slide ${idx + 1}`}
          >
            <motion.div
              className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${idx === current
                ? "bg-gradient-to-r from-[#5B3A82] to-[#5B3A82]"
                : "bg-white/40"
                }`}
              initial={false}
              animate={{
                opacity: idx === current ? 1 : 0.5,
                scale: idx === current ? 1.3 : 1,
                width: idx === current ? "20px" : "8px"
              }}
              transition={{ duration: 0.3 }}
            />
            {idx === current && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5B3A82] to-[#5B3A82] blur-sm sm:blur-md opacity-40 sm:opacity-50"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
