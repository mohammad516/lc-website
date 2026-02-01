"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
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
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Page Title */}
          <h1 className="mb-12 text-center font-serif text-4xl font-normal tracking-wide text-neutral-900 md:text-5xl lg:text-6xl">
            Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="mb-6 text-lg text-neutral-600">
                Your cart is empty
              </p>
              <Link
                href="/"
                className="rounded-lg border-2 border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-wide text-white transition-all hover:bg-neutral-800"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items - Mobile Layout */}
              <div className="space-y-6 md:hidden">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-neutral-200 pb-6 last:border-b-0"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-neutral-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="mb-1 text-base font-bold text-neutral-900 break-words">
                          {item.name}
                        </h3>
                        <p className="mb-1 text-sm font-normal text-neutral-900">
                          {item.price.toLocaleString()} $
                        </p>
                        {item.variant && (
                          <p className="mb-2 text-xs font-normal text-neutral-600 break-words">
                            {item.variant}
                          </p>
                        )}
                        
                        {/* Quantity and Total on Mobile */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-neutral-600">Qty:</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min="1"
                              className="h-8 w-12 border border-neutral-300 text-center text-sm font-normal text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                            />
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-neutral-900">
                              {(item.price * item.quantity).toLocaleString()} $
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="mt-2 text-xs font-normal text-neutral-500 underline hover:text-neutral-900 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Table - Desktop Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="pb-4 text-left text-sm font-bold text-neutral-900">
                        Product
                      </th>
                      <th className="pb-4 text-center text-sm font-bold text-neutral-900">
                        Quantity
                      </th>
                      <th className="pb-4 text-right text-sm font-bold text-neutral-900">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-neutral-200 last:border-b-0"
                      >
                        {/* Product Column */}
                        <td className="py-6">
                          <div className="flex items-center gap-4">
                            {/* Product Image */}
                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-neutral-100">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1">
                              <h3 className="mb-1 text-base font-bold text-neutral-900">
                                {item.name}
                              </h3>
                              <p className="mb-1 text-sm font-normal text-neutral-900">
                                {item.price.toLocaleString()} $
                              </p>
                              {item.variant && (
                                <p className="mb-2 text-xs font-normal text-neutral-600">
                                  {item.variant}
                                </p>
                              )}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-xs font-normal text-neutral-500 underline hover:text-neutral-900 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Quantity Column */}
                        <td className="py-6 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min="1"
                              className="h-8 w-12 border border-neutral-300 text-center text-sm font-normal text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                            />
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs font-normal text-neutral-500 underline hover:text-neutral-900 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </td>

                        {/* Total Column */}
                        <td className="py-6 text-right">
                          <p className="text-base font-normal text-neutral-900">
                            {(item.price * item.quantity).toLocaleString()} $
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cart Summary */}
              <div className="mt-12 flex flex-col items-end border-t border-neutral-200 pt-8">
                <div className="w-full max-w-md space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-neutral-900">
                      Total
                    </span>
                    <span className="text-lg font-medium text-neutral-900">
                      {totalPrice.toLocaleString()} $
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Taxes and shipping calculated at checkout
                  </p>
                  <button
                    onClick={handleCheckout}
                    className="w-full rounded-lg border-2 border-neutral-900 bg-neutral-900 px-6 py-4 text-sm font-medium uppercase tracking-wide text-white transition-all hover:bg-neutral-800 flex items-center justify-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
