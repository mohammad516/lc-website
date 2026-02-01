"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AddToCartNotificationProps {
  product: {
    name: string;
    price: number;
    image: string;
    options?: Record<string, string>;
  };
  onClose: () => void;
}

export default function AddToCartNotification({
  product,
  onClose,
}: AddToCartNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Format product details
  const formatOptions = () => {
    if (!product.options) return "";
    return Object.entries(product.options)
      .map(([key, value]) => `${value}`)
      .join(" / ");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 right-4 md:bottom-8 md:top-auto md:right-8 z-[100] w-auto max-w-[90vw] md:max-w-sm"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-50">

            {/* Header - Purple Brand Style */}
            <div className="bg-[#5B3A82] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1 rounded-full">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
                <p className="text-sm font-medium text-white tracking-wide">
                  Added to your cart!
                </p>
              </div>
              <button onClick={() => setIsVisible(false)} className="text-white/80 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Product Details */}
            <div className="p-4 bg-white">
              <div className="flex gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-50 shadow-sm border border-neutral-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-sm font-medium text-[#5B3A82] line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-neutral-600 mt-0.5">
                    ${product.price ? product.price.toLocaleString() : "0.00"}
                  </p>
                  {product.options && (
                    <p className="text-[10px] text-neutral-400 mt-1 truncate">
                      {formatOptions()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 p-4 pt-0">
              <Link
                href="/cart"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-full border border-[#5B3A82] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#5B3A82] transition-colors hover:bg-purple-50"
              >
                <ShoppingBag size={14} />
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="flex items-center justify-center rounded-full bg-[#5B3A82] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-md shadow-purple-900/10 transition-colors hover:bg-[#4a2e6b]"
              >
                Checkout
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
