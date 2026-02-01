"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  // Handle initial app load
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }, pathname === '/' ? 1000 : 300); // Shorter delay for non-home pages

      return () => clearTimeout(timer);
    }
  }, [isLoading, pathname]);

  // Track navigation to home page
  useEffect(() => {
    if (pathname === '/' && !isLoading) {
      // User navigated to home page (clicked logo)
      setIsNavigating(true);
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }, 800);

      return () => clearTimeout(timer);
    } else if (pathname !== '/') {
      // Reset when leaving home page
      setIsNavigating(false);
    }
  }, [pathname, isLoading]);

  const shouldShow = isLoading || isNavigating;

  if (!isVisible && !shouldShow) {
    return null;
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center"
          >
            <Image
              src="/logo.png"
              alt="LC Organic Logo"
              width={150}
              height={150}
              className="object-contain"
              priority
              unoptimized
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

