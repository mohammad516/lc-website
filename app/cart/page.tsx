"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28 lg:pt-32 pb-24 md:pb-12">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Page Title */}
          <h1 className="mb-12 text-center font-serif text-4xl font-normal tracking-wide text-[#5B3A82] md:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-lora), serif' }}>
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#5B3A82]">
              <div className="h-24 w-24 rounded-full bg-neutral-50 flex items-center justify-center mb-6">
                <ShoppingBag size={48} className="text-neutral-300" />
              </div>
              <p className="mb-8 text-lg text-neutral-500 font-light">
                Your cart is currently empty.
              </p>
              <Link
                href="/"
                className="rounded-full bg-[#483063] px-10 py-4 text-sm font-medium tracking-wide text-white transition-all hover:bg-[#5B3A82] shadow-lg"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Cart Items */}
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex gap-4 sm:gap-6 border-b border-neutral-100 pb-8 last:border-b-0"
                  >
                    {/* Product Image */}
                    <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-50 shadow-sm transition-transform group-hover:scale-[1.02]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2" // Changed to object-contain with padding
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-base sm:text-lg font-medium text-slate-500 mb-1 line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="text-base sm:text-lg font-medium text-[#5B3A82] ml-4">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        {item.variant && (
                          <p className="text-xs sm:text-sm text-neutral-400 font-light">
                            {item.variant}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Pill - Optimized for mobile */}
                        <div className="flex items-center rounded-full border border-neutral-100 px-1 py-1 bg-white shadow-sm scale-90 sm:scale-100 origin-left">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center text-[#5B3A82] hover:bg-purple-50 rounded-full transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 sm:w-10 text-center text-sm font-medium text-slate-600">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center text-[#5B3A82] hover:bg-purple-50 rounded-full transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#5B3A82] hover:text-red-500 transition-colors uppercase tracking-wider font-medium"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="mt-12 rounded-3xl bg-neutral-50/50 p-8 sm:p-10 border border-neutral-100">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-6">
                    <span className="text-sm font-medium text-[#5B3A82] uppercase tracking-[0.2em]">
                      SUBTOTAL
                    </span>
                    <span className="text-2xl font-medium text-[#5B3A82]">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <p className="text-center text-xs text-neutral-400 font-light italic">
                      Taxes and shipping calculated at checkout
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        href="/"
                        className="flex-1 items-center justify-center rounded-full border border-[#5B3A82] px-8 py-4 text-center text-sm font-medium text-[#5B3A82] transition-all hover:bg-purple-50"
                      >
                        Continue Shopping
                      </Link>
                      <button
                        onClick={handleCheckout}
                        className="flex-[2] flex items-center justify-center gap-3 rounded-full bg-[#483063] px-8 py-4 text-center text-sm font-medium text-white shadow-xl hover:bg-[#5B3A82] transition-all"
                      >
                        <Lock className="h-4 w-4" />
                        Complete Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
