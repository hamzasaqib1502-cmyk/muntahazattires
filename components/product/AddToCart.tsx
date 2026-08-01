"use client";

import { useEffect, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

type AddToCartProps = {
  itemId: string;
  name: string;
  stock: number;
};

export function AddToCart({ itemId, name, stock }: AddToCartProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2500);
    return () => clearTimeout(timer);
  }, [added]);

  if (stock <= 0) {
    return (
      <div className="mt-6 border border-gray-200 p-5">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Out of stock — check back soon
        </p>
      </div>
    );
  }

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(stock, q + 1));

  const handleAdd = () => {
    addItem(itemId, quantity);
    setAdded(true);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between border border-gray-200">
        <span className="px-4 text-xs font-medium uppercase tracking-widest text-gray-500">
          Quantity
        </span>
        <div className="flex items-center">
          <button
            onClick={decrease}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="p-3 text-black transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium text-black">
            {quantity}
          </span>
          <button
            onClick={increase}
            disabled={quantity >= stock}
            aria-label="Increase quantity"
            className="p-3 text-black transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className="mt-4 w-full bg-black px-6 py-4 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800"
      >
        Add to Cart
      </button>

      <div role="status" aria-live="polite">
        {added && (
          <p className="mt-3 flex items-center gap-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-black" />
            {name} added to your bag.
          </p>
        )}
      </div>
    </div>
  );
}
