"use client";
import type React from "react";
import { motion } from "framer-motion";
import { Mail, Heart, Facebook, Instagram } from "lucide-react";
import { FaWhatsapp, FaTiktok } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

// Back to Top Button Component
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <motion.button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-[#5B3A82] to-[#5B3A82] text-white shadow-lg hover:shadow-xl transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      initial={{ scale: 0, rotate: -180 }}
      animate={{
        scale: isVisible ? 1 : 0,
        rotate: isVisible ? 0 : -180,
        y: [0, -8, 0]
      }}
      whileHover={{
        scale: 1.1,
        y: -2
      }}
      whileTap={{ scale: 0.95 }}
      transition={{
        duration: 0.3,
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </motion.button>
  );
};

// Social Icon Component
const SocialIcon = ({
  href,
  icon: Icon,
  label,
  delay = 0
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  delay?: number;
}) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="p-2 rounded-lg bg-white/10 dark:bg-neutral-800/20 backdrop-blur-sm border border-white/20 dark:border-neutral-700/30 hover:border-[#5B3A82]/50 transition-all duration-300"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    whileHover={{
      scale: 1.1,
      rotate: 5,
      y: -2
    }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className="w-5 h-5 text-neutral-600 dark:text-neutral-300 hover:text-[#5B3A82] transition-colors duration-300" />
    <span className="sr-only">{label}</span>
  </motion.a>
);

const Footer = () => (
  <>
    <footer className="relative mt-20 md:mt-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#F7F7F7] dark:from-neutral-900/80 dark:via-neutral-800/60 dark:to-neutral-900/80" />

      {/* Animated Gradient Divider */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#5B3A82] to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      <div className="relative py-12 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Logo Section */}
          <Link href="/">
            <motion.div
              className="flex items-center group"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{
                scale: 1.05,
                filter: "drop-shadow(0 0 25px rgba(218, 0, 55, 0.4))"
              }}
            >
              <Image
                src="/logo.png"
                alt="LC OrganicLogo"
                width={180}
                height={180}
                className="h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-32 lg:w-32 xl:h-36 xl:w-36 object-contain transition-all duration-300 group-hover:scale-110 cursor-pointer"
                priority
              />
            </motion.div>
          </Link>

          {/* Social Media Icons */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SocialIcon href="https://wa.me/96170717397?text=Hello" icon={FaWhatsapp} label="WhatsApp" delay={0} />
            <SocialIcon href="https://www.facebook.com" icon={Facebook} label="Facebook" delay={0.1} />
            <SocialIcon href="https://www.instagram.com/maze__lb/" icon={Instagram} label="Instagram" delay={0.2} />
            <SocialIcon href="https://www.tiktok.com" icon={FaTiktok} label="TikTok" delay={0.3} />
          </motion.div>

          {/* Copyright and Email */}
          <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-6 text-center lg:text-left">
            <motion.div
              className="text-sm text-[#171717] dark:text-neutral-300 flex items-center justify-center gap-1.5 flex-wrap px-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="font-medium">Copyright © {new Date().getFullYear()} LC ORGANIC.</span>
              <span className="text-[#444444] dark:text-neutral-400 ml-3 md:ml-0">All Rights Reserved.</span>
              <motion.div
                className="inline-flex items-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-4 h-4 text-[#5B3A82] mx-0.5" fill="#5B3A82" />
              </motion.div>
            </motion.div>

            {/* Divider for large screens */}
            <div className="hidden lg:block text-neutral-300 dark:text-neutral-600">|</div>

            <motion.a
              href="mailto:info@lc-organic.com"
              className="inline-flex items-center gap-2 text-sm text-[#171717] hover:text-[#5B3A82] transition-all duration-300 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:underline"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <Mail className="w-4 h-4 text-[#171717]" />
              info@lc-organic.com
            </motion.a>
          </div>
        </div>
      </div>
    </footer>

    {/* Back to Top Button */}
    <BackToTopButton />
  </>
);

export default Footer;
