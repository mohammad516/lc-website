"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// ============================================
// FEATURED PRODUCTS COMPONENT
// Exact match to "Meet Your Match" UI design
// ============================================

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  enableSale?: boolean;
  image: string;
  slug: string;
  category?: string;
}

// Category tabs configuration
const CATEGORY_TABS = [
  { id: "hair-routine", label: "Hair Routine" },
  { id: "hair-fragrance", label: "Hair Fragrance" },
  { id: "hair-styling", label: "Hair Styling" },
  { id: "hair-accessories", label: "Hair Accessories" },
] as const;

// Colors from design
const PRIMARY_PURPLE = "#5B3A82";
const PRODUCT_NAME_COLOR = "#5B3A82"; // Purple-ish color for product names
const PRICE_COLOR = "#888888"; // Gray for prices

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("hair-routine");
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch featured products from API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?featured=true');

        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Failed to fetch featured products');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Format price for display (matches reference: $XX.XX format)
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Display first 4 products
  const displayedProducts = products.slice(0, 4);

  // Loading skeleton
  if (loading) {
    return (
      <section className="w-full bg-white py-12 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Title Skeleton */}
          <div className="text-center mb-6">
            <div className="h-8 md:h-10 w-56 bg-neutral-100 animate-pulse rounded mx-auto" />
          </div>

          {/* Tabs Skeleton */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-24 bg-neutral-100 animate-pulse rounded-full" />
            ))}
          </div>

          {/* View All Skeleton */}
          <div className="flex justify-center mb-10">
            <div className="h-9 w-20 bg-neutral-100 animate-pulse rounded-full" />
          </div>

          {/* Products Skeleton */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-40 md:w-44">
                <div className="aspect-square bg-neutral-100 animate-pulse rounded mb-3" />
                <div className="h-4 w-full bg-neutral-100 animate-pulse rounded mb-2" />
                <div className="h-3 w-16 bg-neutral-100 animate-pulse rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white py-8 md:py-16 lg:py-20">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">

        {/* ============================================
            TITLE - "Meet Your Match"
            Elegant serif, centered, matches reference
            ============================================ */}
        <h2
          className="text-center text-3xl md:text-4xl mb-5 md:mb-8"
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontWeight: 400,
            color: "#2D2D2D",
            letterSpacing: "0.02em"
          }}
        >
          Meet Your Match
        </h2>

        {/* ============================================
            CATEGORY TABS
            Horizontal scrollable on mobile
            Rounded pills matching reference exactly
            ============================================ */}
        <div
          ref={tabsContainerRef}
          className="flex md:justify-center gap-2 md:gap-3 mb-4 md:mb-5 overflow-x-auto pb-2 scrollbar-hide px-4 md:px-0"
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[11px] md:text-sm whitespace-nowrap transition-all duration-200",
                  isActive
                    ? "text-white shadow-sm"
                    : "bg-white text-neutral-500 border border-neutral-100 md:border-neutral-300 hover:border-neutral-400"
                )}
                style={{
                  backgroundColor: isActive ? PRIMARY_PURPLE : undefined,
                  fontWeight: isActive ? 500 : 400,
                }}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ============================================
            "VIEW ALL" BUTTON
            Centered, rounded outline, purple border
            ============================================ */}
        <div className="flex justify-center mb-6 md:mb-12">
          <Link
            href="/category/all"
            className="px-5 md:px-6 py-1.5 md:py-2 rounded-full text-[11px] md:text-sm border transition-all duration-200 hover:bg-purple-50"
            style={{
              borderColor: PRIMARY_PURPLE,
              color: PRIMARY_PURPLE,
              fontWeight: 500,
            }}
          >
            View all
          </Link>
        </div>

        {/* ============================================
            PRODUCTS
            Mobile: 2-column grid
            Desktop: 4-column grid (larger items)
            ============================================ */}
        <div className="">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 md:gap-8">
            {displayedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="w-full group"
              >
                {/* Product Image */}
                <div className="relative w-full aspect-[3/4] md:aspect-square mb-2 md:mb-4 pt-2 md:pt-0">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    unoptimized={product.image?.startsWith('http')}
                  />
                </div>

                {/* Product Name - Purple/blue color like reference */}
                <p
                  className="text-center text-[12px] md:text-base leading-tight mb-0.5 md:mb-1 line-clamp-2 px-1 mt-2 md:mt-0"
                  style={{
                    color: PRODUCT_NAME_COLOR,
                    fontWeight: 400,
                  }}
                >
                  {product.name}
                </p>

                {/* Product Price - Gray, smaller */}
                <p
                  className="text-center text-[12px] md:text-sm"
                  style={{ color: PRICE_COLOR, marginTop: '2px' }}
                >
                  {product.enableSale && product.salePrice
                    ? formatPrice(product.salePrice)
                    : formatPrice(product.price)
                  }
                </p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
