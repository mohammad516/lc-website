"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface Snowflake {
  left: number;
  baseY: number;
  size: number;
  speed: number;
  drift: number;
  opacity: number;
}

export default function ShopNow() {
  const snowflakesRef = useRef<Snowflake[]>([]);
  const flakeElsRef = useRef<HTMLSpanElement[]>([]);
  const scrollYRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Initialize snowflakes once
  useEffect(() => {
    snowflakesRef.current = Array.from({ length: 18 }).map(() => {
      const depth = Math.random(); // 0 (far) → 1 (near)

      return {
        left: Math.random() * 100,
        baseY: Math.random() * 400,
        size: 6 + depth * 16,
        speed: 0.15 + depth * 0.6,
        drift: Math.random() * 40 - 20,
        opacity: 0.3 + depth * 0.5,
      };
    });
  }, []);

  // Track scroll position (no re-render)
  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Animate snowflakes (DOM only)
  useEffect(() => {
    const animate = () => {
      flakeElsRef.current.forEach((el, i) => {
        const flake = snowflakesRef.current[i];
        if (!el || !flake) return;

        const y = flake.baseY + scrollYRef.current * flake.speed;

        el.style.transform = `translate(${flake.drift}px, ${y}px)`;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden flex items-center justify-center">
      {/* Background Image (safe for deploy) */}
      <div className="absolute inset-0">
        <Image
          src="/sho.png"
          alt="Shop Now"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Snow layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {snowflakesRef.current.map((flake, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) flakeElsRef.current[i] = el;
            }}
            className="absolute text-white select-none"
            style={{
              left: `${flake.left}%`,
              fontSize: flake.size,
              opacity: flake.opacity,
              willChange: "transform",
            }}
          >
            ❄
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 gap-10">
        <h2 className="text-white text-xl sm:text-2xl md:text-4xl font-medium tracking-wide whitespace-nowrap drop-shadow-md">
          Let it grow, let it grow, let it grow!
        </h2>

        <Link
          href="/shop"
          className="bg-[#9F8AB2] hover:bg-[#8A72A1] text-white text-lg font-medium px-10 py-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
        >
          Shop Now!
        </Link>
      </div>
    </section>
  );
}
