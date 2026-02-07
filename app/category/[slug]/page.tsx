"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, use, useEffect } from "react";
import { Filter, ChevronDown, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import AddToCartNotification from "@/components/AddToCartNotification";

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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Cart Notification */}
      {showNotification && notificationProduct && (
        <AddToCartNotification
          product={notificationProduct}
          onClose={() => setShowNotification(false)}
        />
      )}
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

                <Link
                  href="/category/all"
                  className="px-5 py-2 rounded-full border border-[#5B3A82] text-[12px] sm:text-sm font-medium hover:bg-[#5B3A82] hover:text-white transition-all whitespace-nowrap"
                >
                  View all
                </Link>
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
                  <div key={product.id} className="group flex flex-col">
                    {/* Product Image */}
                    <div className="relative aspect-square w-full mb-3 pt-4">
                      <Link href={`/products/${product.slug}`}>
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-contain transition-transform duration-500 group-hover:scale-105"
                          unoptimized={product.image?.startsWith('http')}
                        />
                      </Link>

                      {/* Sale Badge */}
                      {product.enableSale && product.salePrice && (
                        <div className="absolute left-3 top-3 z-10 rounded bg-[#5B3A82] px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-white">
                          Sale
                        </div>
                      )}
                    </div>

                    {/* Product Info - Centered as per image */}
                    <div className="mt-5 flex flex-col items-center text-center gap-1 w-full px-2">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-sm sm:text-lg font-normal text-[#5B3A82] tracking-tight leading-tight truncate w-full">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price and Cart */}
                      <div className="flex items-center justify-center gap-2 mt-1">
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
                            setShowNotification(false);
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

