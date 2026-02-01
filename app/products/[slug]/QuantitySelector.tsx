"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxStock?: number;
}

export default function QuantitySelector({
  quantity,
  onQuantityChange,
  maxStock,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    // Don't exceed stock if maxStock is provided
    if (maxStock && newQuantity > maxStock) {
      return;
    }
    onQuantityChange(newQuantity);
  };

  return (
    <div className="flex h-[52px] w-[140px] items-center justify-between rounded-full border border-neutral-300 px-4">
      <button
        onClick={handleDecrease}
        disabled={quantity <= 1}
        className="flex h-full items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="text-lg font-light text-neutral-900">
        {quantity}
      </span>
      <button
        onClick={handleIncrease}
        disabled={maxStock !== undefined && quantity >= maxStock}
        className="flex h-full items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

