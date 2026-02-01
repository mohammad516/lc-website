"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, FileText, Truck } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Only render on client side
  if (typeof window === "undefined") {
    return null;
  }

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 z-[9999] w-full max-w-md bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              height: "100dvh",
              maxHeight: "100dvh"
            }}
          >
            <div className="flex h-full flex-col relative text-[#5B3A82]">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 flex-shrink-0 bg-white">
                {/* Close Button - Left aligned, circular light bg */}
                <button
                  onClick={onClose}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-500 hover:bg-neutral-100 transition-colors"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Center Title - Purple with Icon */}
                <div className="flex items-center gap-2 text-[#5B3A82]">
                  <ShoppingBag className="w-5 h-5" />
                  <h2 className="text-lg font-normal mb-0.5">
                    Cart ({cartCount})
                  </h2>
                </div>

                {/* Spacer to balance center alignment */}
                <div className="w-10" />
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-6 py-6 pb-48 md:pb-6">
                {cartItems.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-300">
                      <ShoppingBag size={40} />
                    </div>
                    <p className="text-neutral-400">Your cart is currently empty.</p>
                    <button onClick={onClose} className="text-[#5B3A82] font-medium hover:underline">Start Shopping</button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-start">
                        {/* Product Image */}
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-50">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          {/* Row 1: Title & Price */}
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-[15px] font-normal text-slate-500 truncate pr-4">
                              {item.name}
                            </h3>
                            <p className="text-[15px] font-medium text-slate-500">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>

                          {item.variant && (
                            <p className="mb-4 text-xs text-neutral-400">
                              {item.variant}
                            </p>
                          )}

                          {/* Row 2: Controls */}
                          <div className="flex items-center gap-6 mt-4">
                            {/* Quantity Pill - Rounded */}
                            <div className="flex items-center rounded-full border border-neutral-100 px-1 py-1 bg-white shadow-sm">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity - 1)
                                }
                                className="flex h-7 w-8 items-center justify-center text-[#5B3A82] hover:bg-purple-50 rounded-full transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-slate-600">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity + 1)
                                }
                                className="flex h-7 w-8 items-center justify-center text-[#5B3A82] hover:bg-purple-50 rounded-full transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Remove Button with Trash Icon */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="flex items-center gap-2 text-xs text-[#5B3A82] hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div
                  className="bg-white"
                  style={{
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Options Grid - Order note | View cart */}
                  <div className="grid grid-cols-2 border-t border-b border-neutral-50 divide-x divide-neutral-50">
                    <button className="flex items-center justify-center gap-2 py-4 text-xs font-medium text-[#5B3A82] hover:bg-purple-50 transition-colors">
                      <FileText size={16} />
                      Order note
                    </button>
                    {/* View cart button */}
                    <button
                      onClick={() => {
                        onClose();
                        router.push("/cart");
                      }}
                      className="flex items-center justify-center gap-2 py-4 text-xs font-medium text-[#5B3A82] hover:bg-purple-50 transition-colors"
                    >
                      <ShoppingBag size={16} />
                      View cart
                    </button>
                  </div>

                  {/* Total & Checkout */}
                  <div className="p-6 pb-8">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[#5B3A82] text-sm uppercase font-medium">TOTAL</span>
                      <span className="text-[#5B3A82] text-lg font-medium">${totalPrice.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        router.push("/checkout");
                      }}
                      className="w-full rounded-full bg-[#483063] py-4 text-center text-sm font-medium text-white shadow-lg hover:bg-[#5B3A82] transition-all"
                    >
                      Checkout
                    </button>

                    <p className="mt-4 text-center text-[10px] text-slate-400">
                      Taxes and shipping calculated at checkout
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerContent, document.body);
}
