"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Snowflake {
    id: number;
    left: number;
    baseY: number;
    size: number;
    speed: number;
    drift: number;
    opacity: number;
}

export default function ShopNow() {
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
    const scrollRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    // Initialize snowflakes
    useEffect(() => {
        const flakes: Snowflake[] = Array.from({ length: 18 }).map((_, i) => {
            const depth = Math.random(); // 0 (far) → 1 (near)

            return {
                id: i,
                left: Math.random() * 100,
                baseY: Math.random() * 400,
                size: 6 + depth * 16,
                speed: 0.15 + depth * 0.6,
                drift: Math.random() * 40 - 20,
                opacity: 0.3 + depth * 0.5,
            };
        });

        setSnowflakes(flakes);
    }, []);

    // Scroll listener (no re-render)
    useEffect(() => {
        const onScroll = () => {
            scrollRef.current = window.scrollY;
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Force smooth animation updates
    const [, forceRender] = useState(0);
    useEffect(() => {
        const loop = () => {
            forceRender((v) => v + 1);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden flex items-center justify-center">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/shopnow.png')" }}
            />

            {/* Snow layer */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {snowflakes.map((flake) => {
                    const y =
                        (flake.baseY + scrollRef.current * flake.speed) % 700;

                    return (
                        <span
                            key={flake.id}
                            className="absolute text-white select-none"
                            style={{
                                left: `${flake.left}%`,
                                transform: `translate(${flake.drift}px, ${y}px)`,
                                fontSize: flake.size,
                                opacity: flake.opacity,
                                transition: "transform 0.15s linear",
                            }}
                        >
                            ❄
                        </span>
                    );
                })}
            </div>

            {/* Content */}
            <div className="relative z-20 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-white text-xl sm:text-2xl md:text-5xl font-medium md:font-normal mb-24 md:mb-12 whitespace-nowrap tracking-wide drop-shadow-md">
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
