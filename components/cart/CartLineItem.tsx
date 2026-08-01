"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Item } from "@/lib/types";

export function CartLineItem({
  item,
  quantity,
}: {
  item: Item;
  quantity: number;
}) {
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const outOfStock = item.stock <= 0;
  const canDecrease = !outOfStock && quantity > 1;
  const canIncrease = !outOfStock && quantity < item.stock;

  return (
    <li className="flex gap-4 border-b border-gray-200 py-5">
      <Link
        href={`/item/${item.id}`}
        className="relative block h-24 w-20 shrink-0 overflow-hidden bg-gray-100"
      >
        <Image
          src={item.images[0] ?? "/logo.png"}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/item/${item.id}`}
              className="block truncate text-sm font-medium uppercase tracking-wide text-black transition-colors hover:text-gray-700"
            >
              {item.name}
            </Link>
            <p className="mt-1 text-xs text-gray-500">
              {formatCurrency(item.price)} each
            </p>
            {outOfStock && (
              <p className="mt-1.5 inline-block border border-gray-300 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-gray-600">
                Out of stock
              </p>
            )}
          </div>
          <button
            onClick={() => removeItem(item.id)}
            aria-label={`Remove ${item.name} from bag`}
            className="p-1 text-gray-500 transition-colors hover:text-black"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center border border-gray-200">
            <button
              onClick={() => setQuantity(item.id, quantity - 1)}
              disabled={!canDecrease}
              aria-label="Decrease quantity"
              className="p-2 text-black transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-black">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(item.id, quantity + 1)}
              disabled={!canIncrease}
              aria-label="Increase quantity"
              className="p-2 text-black transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm font-semibold text-black">
            {formatCurrency(item.price * quantity)}
          </p>
        </div>
      </div>
    </li>
  );
}
