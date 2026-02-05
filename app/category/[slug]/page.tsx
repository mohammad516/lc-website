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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-32 md:pt-40 lg:pt-48">
        {/* Header Section - With subtle separator line */}
        <section className="w-full bg-white pt-8 pb-6 border-b border-neutral-100">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-[#5B3A82]">
              {category?.title || ""}
            </h1>
          </div>
        </section>

        {/* Products Section */}
        <section className="w-full bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            {/* Filter & Sort Bar - Matching latest design image */}
            <div className="mb-12 pb-2">
              <div className="flex items-center justify-between text-[#5B3A82]">
                <div className="flex items-center gap-4">
                  {/* Custom Filter Icon (Decreasing horizontal bars) */}
                  <div className="flex flex-col gap-[3px]">
                    <div className="h-[2px] w-5 bg-current rounded-full" />
                    <div className="h-[2px] w-3.5 bg-current rounded-full mx-auto" />
                    <div className="h-[2px] w-2 bg-current rounded-full mx-auto" />
                  </div>

                  <div className="relative flex items-center group cursor-pointer">
                    <span className="text-[15px] sm:text-lg font-normal tracking-tight uppercase sm:capitalize">
                      Filter & sort ({sortedProducts.length})
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Sort products"
                    >
                      <option value="price-low">Price, low to high</option>
                      <option value="price-high">Price, high to low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-neutral-600">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
                {sortedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group flex flex-col"
                  >
                    {/* Product Image */}
                    {/* Product Image */}
                    <div className="relative aspect-square w-full mb-3 pt-4">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                        unoptimized={product.image?.startsWith('http')}
                      />

                      {/* Sale Badge */}
                      {product.enableSale && product.salePrice && (
                        <div className="absolute left-3 top-3 z-10 rounded bg-[#5B3A82] px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-white">
                          Sale
                        </div>
                      )}

                      {/* Wishlist Icon - Matching design exactly */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product.id);
                        }}
                        className="absolute right-3 top-3 z-10 rounded-full bg-white w-10 h-10 flex items-center justify-center shadow-md transition-all hover:scale-110"
                        aria-label="Add to wishlist"
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${wishlist.has(product.id)
                            ? "fill-[#5B3A82] text-[#5B3A82]"
                            : "text-neutral-400"
                            }`}
                          strokeWidth={1.5}
                        />
                      </button>
                    </div>

                    {/* Product Info - Centered as per image */}
                    <div className="mt-5 flex flex-col items-center text-center gap-1 w-full px-2">
                      <h3 className="text-sm sm:text-lg font-normal text-[#5B3A82] tracking-tight leading-tight truncate w-full">
                        {product.name}
                      </h3>
                      <div className="flex flex-col items-center">
                        {product.enableSale && product.salePrice ? (
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-neutral-400 line-through">
                              ${product.originalPrice?.toLocaleString()}
                            </p>
                            <p className="text-md font-normal text-[#5B3A82]/80">
                              ${product.salePrice.toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-md font-normal text-[#5B3A82]/80">
                            ${product.price.toLocaleString()}
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

