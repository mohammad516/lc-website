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
    // Use state for rendering snowflakes
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

    // Refs for animation performance
    const flakeElsRef = useRef<(HTMLSpanElement | null)[]>([]);
    const scrollYRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    // Initialize snowflakes once on mount
    useEffect(() => {
        const flakes = Array.from({ length: 18 }).map(() => {
            const depth = Math.random(); // 0 (far) → 1 (near)
            return {
                left: Math.random() * 100,
                baseY: Math.random() * 700, // Fill larger height initially
                size: 16 + depth * 20,
                speed: 0.15 + depth * 0.6,
                drift: Math.random() * 40 - 20,
                opacity: 0.6 + depth * 0.35,
            };
        });
        setSnowflakes(flakes);
    }, []);

    // Track scroll position
    useEffect(() => {
        const onScroll = () => {
            scrollYRef.current = window.scrollY;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Animation Loop
    useEffect(() => {
        if (snowflakes.length === 0) return;

        const animate = () => {
            flakeElsRef.current.forEach((el, i) => {
                const flake = snowflakes[i];
                if (!el || !flake) return;

                // Modulo arithmetic to loop snow within container
                const y = (flake.baseY + scrollYRef.current * flake.speed) % 700;

                el.style.transform = `translate(${flake.drift}px, ${y}px)`;
            });
            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [snowflakes]);

    return (
        <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/shopnow.png"
                    alt="Shop Now"
                    fill
                    priority
                    className="object-cover"
                />
            </div>

            {/* Snow layer */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {snowflakes.map((flake, i) => (
                    <span
                        key={i}
                        ref={(el) => {
                            flakeElsRef.current[i] = el;
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

            {/* Headline - Upper Middle */}
            <h2 className="absolute z-20 top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xl sm:text-2xl md:text-4xl font-medium tracking-wide whitespace-nowrap drop-shadow-md">
                Let it grow, let it grow, let it grow!
            </h2>

            {/* Button - Lower Position */}
            <Link
                href="/shop"
                className="absolute z-20 bottom-[18%] left-1/2 -translate-x-1/2 bg-[#9F8AB2] hover:bg-[#8A72A1] text-white text-base md:text-lg font-medium px-8 md:px-10 py-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
            >
                Shop Now!
            </Link>
        </section>
    );
}
