"use client";

import { useEffect, useState } from "react";
import Image from "next/image"
import Link from "next/link"

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to generate href from category name
  const getCategoryHref = (name: string) => {
    return `/category/${name.toLowerCase().replace(/\s+/g, '-')}`;
  };

  if (loading) {
    return (
      <section className="w-full px-4 py-12 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Mobile Skeleton */}
          <div className="flex flex-col gap-4 md:hidden">
            {/* First category skeleton: full width, taller */}
            <div className="h-[600px] overflow-hidden rounded-lg bg-neutral-200 animate-pulse" />
            {/* Second category skeleton: full width */}
            <div className="h-[300px] overflow-hidden rounded-lg bg-neutral-200 animate-pulse" />
            {/* Third and Fourth categories skeleton: same row */}
            <div className="flex gap-4">
              <div className="h-[300px] w-1/2 overflow-hidden rounded-lg bg-neutral-200 animate-pulse" />
              <div className="h-[300px] w-1/2 overflow-hidden rounded-lg bg-neutral-200 animate-pulse" />
            </div>
            {/* Fifth category skeleton: full width */}
            <div className="h-[300px] overflow-hidden rounded-lg bg-neutral-200 animate-pulse" />
          </div>

          {/* Desktop Skeleton */}
          <div className="hidden grid-cols-1 auto-rows-[300px] gap-4 md:grid md:grid-cols-3 lg:gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-lg bg-neutral-200 animate-pulse ${
                  i === 1 ? "md:row-span-2" : ""
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="w-full px-4 py-12 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">No categories available</div>
        </div>
      </section>
    );
  }
  return (
    <section id="categories" className="w-full px-4 py-12 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Mobile: Single column with custom layout */}
        <div className="flex flex-col gap-4 md:hidden">
          {/* First category: full width, taller (hero-style) */}
          {categories[0] && (
            <Link
              key={categories[0].id}
              href={getCategoryHref(categories[0].name)}
              className="group relative h-[600px] overflow-hidden rounded-lg"
            >
            <Image
              src={categories[0].image || "/placeholder.svg"}
              alt={categories[0].name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={categories[0].image?.startsWith('http')}
            />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-4 right-4 rounded-sm bg-white px-4 py-2 shadow-lg transition-transform duration-300 group-hover:scale-105">
                <span className="text-sm font-medium text-foreground">{categories[0].name}</span>
              </div>
            </Link>
          )}

          {/* Second category: full width */}
          {categories[1] && (
            <Link
              key={categories[1].id}
              href={getCategoryHref(categories[1].name)}
              className="group relative h-[300px] overflow-hidden rounded-lg"
            >
            <Image
              src={categories[1].image || "/placeholder.svg"}
              alt={categories[1].name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={categories[1].image?.startsWith('http')}
            />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-4 right-4 rounded-sm bg-white px-4 py-2 shadow-lg transition-transform duration-300 group-hover:scale-105">
                <span className="text-sm font-medium text-foreground">{categories[1].name}</span>
              </div>
            </Link>
          )}

          {/* Third and Fourth categories: same row, 50% each */}
          {categories[2] && categories[3] && (
            <div className="flex gap-4">
              <Link
                key={categories[2].id}
                href={getCategoryHref(categories[2].name)}
                className="group relative h-[300px] w-1/2 overflow-hidden rounded-lg"
              >
                <Image
                  src={categories[2].image || "/placeholder.svg"}
                  alt={categories[2].name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized={categories[2].image?.startsWith('http')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-4 right-4 rounded-sm bg-white px-4 py-2 shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <span className="text-sm font-medium text-foreground">{categories[2].name}</span>
                </div>
              </Link>
              <Link
                key={categories[3].id}
                href={getCategoryHref(categories[3].name)}
                className="group relative h-[300px] w-1/2 overflow-hidden rounded-lg"
              >
                <Image
                  src={categories[3].image || "/placeholder.svg"}
                  alt={categories[3].name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized={categories[3].image?.startsWith('http')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-4 right-4 rounded-sm bg-white px-4 py-2 shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <span className="text-sm font-medium text-foreground">{categories[3].name}</span>
                </div>
              </Link>
            </div>
          )}

          {/* Fifth category: full width */}
          {categories[4] && (
            <Link
              key={categories[4].id}
              href={getCategoryHref(categories[4].name)}
              className="group relative h-[300px] overflow-hidden rounded-lg"
            >
            <Image
              src={categories[4].image || "/placeholder.svg"}
              alt={categories[4].name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={categories[4].image?.startsWith('http')}
            />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-4 right-4 rounded-sm bg-white px-4 py-2 shadow-lg transition-transform duration-300 group-hover:scale-105">
                <span className="text-sm font-medium text-foreground">{categories[4].name}</span>
              </div>
            </Link>
          )}
        </div>

        {/* Desktop & Tablet: Keep current 3-column grid */}
        <div className="hidden grid-cols-1 auto-rows-[300px] gap-4 md:grid md:grid-cols-3 lg:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={getCategoryHref(category.name)}
              className={`group relative overflow-hidden rounded-lg ${index === 0 ? "md:row-span-2" : ""}`}
            >
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized={category.image?.startsWith('http')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-4 right-4 rounded-sm bg-white px-4 py-2 shadow-lg transition-transform duration-300 group-hover:scale-105">
                <span className="text-sm font-medium text-foreground">{category.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
