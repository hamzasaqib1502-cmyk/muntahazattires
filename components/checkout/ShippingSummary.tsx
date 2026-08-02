"use client";

import { formatCurrency } from "@/lib/formatCurrency";
import type { Item } from "@/lib/types";

export type SummaryEntry = {
  item: Item;
  quantity: number;
};

export function ShippingSummary({
  entries,
  subtotal,
  shippingCost,
  shippingUnavailable,
  discount,
  promoCode,
  total,
  onSubmit,
  submitting,
  error,
}: {
  entries: SummaryEntry[];
  subtotal: number;
  shippingCost: number;
  shippingUnavailable: boolean;
  discount: number;
  promoCode: string | null;
  total: number;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <aside className="h-fit border border-gray-200 p-6">
      <h2 className="text-sm font-medium uppercase tracking-widest text-black">
        Order Summary
      </h2>

      <ul className="mt-5 space-y-3">
        {entries.map(({ item, quantity }) => (
          <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-gray-700">
              {item.name}
              <span className="ml-1 text-gray-400">× {quantity}</span>
            </span>
            <span className="shrink-0 font-medium text-black">
              {formatCurrency(item.price * quantity)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-3 border-t border-gray-200 pt-5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">Subtotal</dt>
          <dd className="font-medium text-black">{formatCurrency(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">Shipping</dt>
          <dd className="font-medium text-black">
            {shippingUnavailable ? "Contact us" : formatCurrency(shippingCost)}
          </dd>
        </div>
        {discount > 0 && promoCode && (
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">
              Discount
              <span className="ml-1 uppercase tracking-wider">({promoCode})</span>
            </dt>
            <dd className="font-medium text-black">
              −{formatCurrency(discount)}
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <dt className="text-sm font-medium uppercase tracking-widest text-black">
            Total
          </dt>
          <dd className="font-sans text-lg font-semibold text-black">
            {formatCurrency(total)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 border border-gray-200 p-4">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Payment Method
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm font-medium text-black">
          Cash on Delivery
        </p>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={onSubmit}
        disabled={submitting || entries.length === 0}
        className="mt-6 w-full bg-black px-6 py-4 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Placing order…" : "Place Order"}
      </button>
      <p className="mt-4 text-xs leading-5 text-gray-500">
        By placing this order you agree to pay on delivery. You&apos;ll receive
        a confirmation call before your order ships.
      </p>
    </aside>
  );
}
