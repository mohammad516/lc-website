"use client";

import { useEffect, useRef, useState } from "react";
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
  const [data, setData] = useState<{ image: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const snowflakesRef = useRef<Snowflake[]>([]);
  const flakeElsRef = useRef<HTMLSpanElement[]>([]);
  const scrollYRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Fetch shopnow data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/shopnow");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching shopnow data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  if (loading) {
    return (
      <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center bg-neutral-100 animate-pulse">
        <div className="text-neutral-400">Loading...</div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={data?.image || "/sho.png"}
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
        <h2 className="text-white text-xl sm:text-2xl md:text-4xl font-medium tracking-wide drop-shadow-md">
          {data?.description || "Let it grow, let it grow, let it grow!"}
        </h2>

        <Link
          href="/category/all"
          className="bg-[#9F8AB2] hover:bg-[#8A72A1] text-white text-lg font-medium px-10 py-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
        >
          Shop Now!
        </Link>
      </div>
    </section>
  );
}
