"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Item } from "@/lib/types";

export function CartView({ items }: { items: Item[] }) {
  const lines = useCartStore((state) => state.lines);

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

  if (populated.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-40 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="h-12 w-12 text-gray-300" strokeWidth={1} />
        <h1 className="font-serif text-3xl text-black sm:text-4xl">
          Your bag is empty
        </h1>
        <p className="max-w-sm text-sm leading-6 text-gray-500">
          Browse the collection and add a few pieces you love before checking
          out.
        </p>
        <Link
          href="/"
          className="mt-2 bg-black px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="border-b border-gray-200 pb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Shopping Bag
        </p>
        <h1 className="mt-2 font-serif text-3xl text-black sm:text-4xl">
          View Bag ({count})
        </h1>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-16">
        <ul>
          {populated.map(({ line, item }) => (
            <CartLineItem key={line.itemId} item={item} quantity={line.quantity} />
          ))}
        </ul>

        <aside className="h-fit border border-gray-200 p-6 lg:sticky lg:top-24">
          <h2 className="text-sm font-medium uppercase tracking-widest text-black">
            Order Summary
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Subtotal</dt>
              <dd className="font-medium text-black">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Shipping</dt>
              <dd className="text-gray-500">Calculated at checkout</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <dt className="text-sm font-medium uppercase tracking-widest text-black">
                Total
              </dt>
              <dd className="font-sans text-lg font-semibold text-black">
                {formatCurrency(subtotal)}
              </dd>
            </div>
          </dl>

          <Link
            href="/checkout"
            className="mt-6 block w-full bg-black px-6 py-4 text-center text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800"
          >
            Checkout
          </Link>
          <Link
            href="/"
            className="mt-3 block w-full border border-black px-6 py-3 text-center text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-gray-100"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
