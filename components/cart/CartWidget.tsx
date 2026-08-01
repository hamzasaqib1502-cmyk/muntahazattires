"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Item } from "@/lib/types";

export function CartWidget({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: Item[];
}) {
  const lines = useCartStore((state) => state.lines);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const itemById = new Map(items.map((item) => [item.id, item]));
  const populated = lines
    .map((line) => ({ line, item: itemById.get(line.itemId) }))
    .filter(
      (entry): entry is { line: (typeof lines)[number]; item: Item } =>
        entry.item !== undefined,
    );
  const subtotal = populated.reduce(
    (sum, entry) => sum + entry.item.price * entry.line.quantity,
    0,
  );
  const count = populated.reduce((sum, entry) => sum + entry.line.quantity, 0);

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 cursor-pointer bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        inert={!open}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <p className="text-sm font-medium uppercase tracking-widest text-black">
            Your Bag ({count})
          </p>
          <button
            onClick={onClose}
            aria-label="Close bag"
            className="p-1 text-gray-500 transition-colors hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {populated.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-gray-300" strokeWidth={1} />
            <p className="font-serif text-xl text-black">Your bag is empty</p>
            <p className="text-sm leading-6 text-gray-500">
              Browse the collection and add a few pieces you love.
            </p>
            <Link
              href="/"
              onClick={onClose}
              className="mt-2 bg-black px-6 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6">
              {populated.map(({ line, item }) => (
                <CartLineItem
                  key={line.itemId}
                  item={item}
                  quantity={line.quantity}
                />
              ))}
            </ul>

            <div className="border-t border-gray-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-widest text-gray-500">
                  Subtotal
                </span>
                <span className="font-sans text-lg font-semibold text-black">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Shipping calculated at checkout.
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full bg-black px-6 py-3 text-center text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full border border-black px-6 py-3 text-center text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-gray-100"
                >
                  View Bag
                </Link>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 text-sm font-medium uppercase tracking-wide text-gray-500 transition-colors hover:text-black"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
