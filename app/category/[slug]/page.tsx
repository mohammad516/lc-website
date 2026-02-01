"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, use, useEffect } from "react";
import { Filter, Heart, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  name: string;
  title: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  enableSale?: boolean;
  image: string;
  images: string[];
  slug: string;
  description: string;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  slug: string;
  products: Product[];
}

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<string>("price-low");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/categories/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Category not found');
            setCategory(null);
          } else {
            throw new Error('Failed to fetch category');
          }
          return;
        }

        const data = await response.json();
        setCategory(data);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category');
        setCategory(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  if (error || (!loading && !category)) {
    notFound();
  }

  // Sort products
  const sortedProducts = category ? [...(category.products || [])].sort((a, b) => {
    if (sortBy === "price-low") {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  }) : [];

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F3]">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28 lg:pt-32">
        {/* Hero Section */}
        <section className="w-full bg-[#FAF7F3]">
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-0">
            {/* Image */}
            <div className="relative h-[400px] w-full overflow-hidden rounded-none -mt-6 md:mt-0 md:h-[600px]">
              {category && (
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={category.image?.startsWith('http')}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center bg-[#f7f5f2] px-8 py-16 md:px-12 md:py-20 lg:px-16 md:h-[600px]">
              <h1 className="mb-8 font-serif text-4xl font-normal tracking-wide uppercase text-neutral-900 md:text-5xl lg:text-6xl">
                {category?.title || ""}
              </h1>
              <p className="text-base leading-relaxed text-neutral-800 md:text-lg lg:text-xl">
                {category?.description || ""}
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="w-full bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
            {/* Top Bar */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-neutral-600" />
                <span className="text-sm font-light uppercase tracking-wide text-neutral-700">
                  Filters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-light text-neutral-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="cursor-pointer border-0 bg-transparent text-sm font-light text-neutral-900 focus:outline-none focus:ring-0"
                >
                  <option value="price-low">Price, low to high</option>
                  <option value="price-high">Price, high to low</option>
                </select>
                <ChevronDown className="h-4 w-4 text-neutral-600" />
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-neutral-600">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {sortedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group relative flex flex-col overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized={product.image?.startsWith('http')}
                      />
                      {/* Sale Badge */}
                      {product.enableSale && product.salePrice && (
                        <div className="absolute left-4 top-4 z-10 rounded bg-[#5B3A82] px-2 py-1 text-xs font-semibold text-white">
                          Sale
                        </div>
                      )}
                      {/* Wishlist Icon */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product.id);
                        }}
                        className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-sm transition-all hover:bg-white"
                        aria-label="Add to wishlist"
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${wishlist.has(product.id)
                              ? "fill-[#5B3A82] text-[#5B3A82]"
                              : "text-neutral-600"
                            }`}
                        />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="mt-4 flex flex-col">
                      <h3 className="mb-1 text-sm font-light text-neutral-900">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {product.enableSale && product.salePrice ? (
                          <>
                            <p className="text-sm font-light text-neutral-600 line-through">
                              {product.originalPrice?.toLocaleString()} $
                            </p>
                            <p className="text-sm font-semibold text-[#5B3A82]">
                              {product.salePrice.toLocaleString()} $
                            </p>
                          </>
                        ) : (
                          <p className="text-sm font-light text-neutral-600">
                            {product.price.toLocaleString()} $
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

