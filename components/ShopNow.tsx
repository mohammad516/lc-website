"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ShopNow() {
  const [data, setData] = useState<{ image: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);

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
