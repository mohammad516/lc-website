"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react"; // Changed from Chevron to Arrow
import { useCart } from "@/contexts/CartContext";
import AddToCartNotification from "@/components/AddToCartNotification";

// ============================================
// FEATURED PRODUCTS COMPONENT
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
  categories?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Colors from design image estimation
const THEME_DARK_PURPLE = "#3D3B69"; // Dark blueish-purple for tabs and text
const PRODUCT_NAME_COLOR = "#5B3A82";
const PRICE_COLOR = "#888888";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Notification State
  interface NotificationProduct {
    name: string;
    price: number;
    image: string;
    options?: Record<string, string>;
  }
  const [notificationProduct, setNotificationProduct] = useState<NotificationProduct | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const { addToCart } = useCart();

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          // Set first category as active by default
          if (data.length > 0) {
            setActiveTab(data[0].id);
          }
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

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

  // Update scroll progress
  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, [products]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth / 2;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };


  // Filter products based on active tab
  const filteredProducts = products.filter((product) => {
    // API already returns featured products only, but safe to filter again if needed
    // const isFeatured = product.isFeatured; 

    if (!activeTab) return true;

    // Find the category object that matches the activeTab ID
    const activeCategory = categories.find(c => c.id === activeTab);

    if (!activeCategory) return true;

    // Check if "All" category is selected (assuming 'all' slug or specific ID for All)
    // Adjust logic if you have a specific "All" category

    // If product has new categories array
    if (product.categories && product.categories.length > 0) {
      return product.categories.includes(activeCategory.name);
    }

    // Fallback for legacy products (should be migrated, but just in case)
    return product.category === activeCategory.name;
  });

  // Display more products for carousel
  const displayedProducts = filteredProducts.slice(0, 10);

  // Determine View All Link
  const activeCategory = categories.find(c => c.id === activeTab);
  const viewAllLink = activeCategory ? `/category/${activeCategory.slug}` : '/category/all';

  // Loading skeleton
  if (loading) {
    return (
      <section className="w-full bg-white py-12 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="h-8 md:h-10 w-56 bg-neutral-100 animate-pulse rounded mx-auto" />
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-24 bg-neutral-100 animate-pulse rounded-full" />
            ))}
          </div>
          <div className="flex justify-center mb-10">
            <div className="h-9 w-20 bg-neutral-100 animate-pulse rounded-full" />
          </div>
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
    <section className="w-full bg-white py-12 md:py-20">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 relative">

        {/* Cart Notification */}
        {showNotification && notificationProduct && (
          <AddToCartNotification
            product={notificationProduct}
            onClose={() => setShowNotification(false)}
          />
        )}

        {/* ============================================
            TITLE - "Meet Your Match"
            ============================================ */}
        <h2
          className="text-center text-4xl md:text-5xl mb-8 md:mb-12 font-sans tracking-tight"
          style={{
            fontWeight: 300,
            color: "#2C2C54",
          }}
        >
          Meet Your Match
        </h2>

        {/* ============================================
            CATEGORY TABS
            ============================================ */}
        <div
          ref={tabsContainerRef}
          className="flex md:justify-center gap-3 md:gap-6 mb-8 md:mb-10 overflow-x-auto pb-2 scrollbar-hide px-4 md:px-0"
        >
          {categories.map((category) => {
            const isActive = activeTab === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={cn(
                  "px-6 py-2 md:px-7 md:py-2.5 rounded-full text-base md:text-lg whitespace-nowrap transition-all duration-300 font-sans",
                  isActive
                    ? "text-white shadow-lg shadow-indigo-100"
                    : "bg-white text-neutral-300 border border-neutral-100 hover:border-neutral-200"
                )}
                style={{
                  backgroundColor: isActive ? THEME_DARK_PURPLE : undefined,
                  fontWeight: isActive ? 500 : 400,
                }}
                aria-pressed={isActive}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {/* ============================================
            "VIEW ALL" BUTTON
            ============================================ */}
        <div className="flex justify-center mb-10 md:mb-16">
          <Link
            href={viewAllLink}
            className="px-8 md:px-10 py-2.5 md:py-3 rounded-full text-sm md:text-base font-sans border transition-all duration-300 hover:bg-neutral-50"
            style={{
              borderColor: THEME_DARK_PURPLE,
              color: THEME_DARK_PURPLE,
              fontWeight: 400,
            }}
          >
            View all
          </Link>
        </div>

        {/* ============================================
            MANUAL CAROUSEL
            ============================================ */}
        <div className="relative group px-0 md:px-12">

          {/* Navigation Arrows (Left) */}
          <button
            onClick={() => scrollCarousel('left')}
            className="flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center text-[#2C2C54] hover:text-purple-700 hover:scale-110 transition-all duration-300 border border-neutral-200"
            aria-label="Scroll left"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="flex gap-6 md:gap-8 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollBehavior: 'smooth' }}
          >
            {displayedProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[45vw] sm:w-[30vw] md:w-[22vw] lg:w-[18vw] snap-center"
              >
                <div className="block group/card h-full">
                  {/* Product Image - REMOVED CARD BACKGROUND */}
                  <div className="relative w-full aspect-[3/4] md:aspect-square mb-3 pt-2 md:pt-0">
                    <Link href={`/products/${product.slug}`}>
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                        className="object-contain transition-transform duration-500 group-hover/card:scale-105"
                        unoptimized={product.image?.startsWith('http')}
                      />
                    </Link>
                  </div>

                  {/* Product Info - RESTORED CLEAN LOOK */}
                  <div className="text-center px-1">
                    <Link href={`/products/${product.slug}`}>
                      <h3
                        className="text-[13px] md:text-base leading-tight mb-1 line-clamp-2 min-h-[2.5em] font-sans"
                        style={{
                          color: PRODUCT_NAME_COLOR,
                          fontWeight: 400,
                        }}
                      >
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price and Cart */}
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <p
                        className="text-[13px] md:text-sm font-sans"
                        style={{ color: PRICE_COLOR }}
                      >
                        {product.enableSale && product.salePrice
                          ? formatPrice(product.salePrice)
                          : formatPrice(product.price)
                        }
                      </p>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          // Determine effective price
                          const effectivePrice = product.enableSale && product.salePrice
                            ? product.salePrice
                            : product.price;

                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: effectivePrice,
                            image: product.image
                          });

                          // Show Notification
                          setNotificationProduct({
                            name: product.name,
                            price: effectivePrice,
                            image: product.image
                          });
                          setShowNotification(false); // Reset to ensure animation plays if already open
                          setTimeout(() => setShowNotification(true), 10);
                        }}
                        className="text-[#5B3A82] hover:scale-110 transition-transform flex items-center justify-center"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows (Right) */}
          < button
            onClick={() => scrollCarousel('right')}
            className="flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center text-[#2C2C54] hover:text-purple-700 hover:scale-110 transition-all duration-300 border border-neutral-200"
            aria-label="Scroll right"
          >
            <ArrowRight className="w-5 h-5 stroke-[1.5]" />
          </button>

        </div>

        {/* Scroll Progress Indicator */}
        <div className="w-full max-w-xs mx-auto mt-2 h-1 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3D3B69] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.max(15, Math.min(100, scrollProgress + 15))}%` }}
          />
        </div>

      </div>
    </section>
  );
}
