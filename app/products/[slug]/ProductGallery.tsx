"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Helper to check if image is external (Cloudinary or other external URLs)
  const isExternalImage = (src: string) => {
    return src.startsWith('http://') || src.startsWith('https://');
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-neutral-100">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-neutral-200" />
        )}
        <Image
          src={images[activeImage]}
          alt="Product image"
          fill
          className="object-contain transition-transform duration-500 ease-out hover:scale-105"
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          onLoad={() => setImageLoaded(true)}
          unoptimized={isExternalImage(images[activeImage])}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4 md:grid-cols-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveImage(index);
                setImageLoaded(false);
              }}
              className={`relative aspect-square w-full overflow-hidden rounded-none border-2 transition-all ${activeImage === index
                  ? "border-neutral-900"
                  : "border-transparent hover:border-neutral-300"
                }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-contain" // Changed from object-cover
                sizes="(max-width: 768px) 25vw, 15vw"
                unoptimized={isExternalImage(image)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
