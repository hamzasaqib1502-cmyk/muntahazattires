"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidateAll } from "@/app/admin/(protected)/actions";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "placed",
  "processing",
  "shipped",
  "delivered",
];

export function OrderDetail({
  order,
  itemImages,
}: {
  order: Order;
  itemImages: Record<string, string>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [updating, setUpdating] = useState<OrderStatus | null>(null);

  async function updateStatus(next: OrderStatus) {
    if (next === status) return;
    setUpdating(next);
    const { error } = await supabase
      .from("orders")
      .update({ status: next })
      .eq("id", order.id);
    if (!error) {
      setStatus(next);
    }
    setUpdating(null);
    await revalidateAll();
    router.refresh();
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-gray-500 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All orders
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
              Order
            </p>
            <h1 className="mt-1 font-serif text-3xl text-black">
              #{order.id.slice(0, 8).toUpperCase()}
            </h1>
          </div>
          <span className="text-xs font-medium uppercase tracking-widest text-gray-500">
            {new Date(order.createdAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </header>

      <section className="border border-gray-200 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-black">
          Items
        </p>
        <ul className="mt-4 divide-y divide-gray-200">
          {order.items.map((item) => (
            <li
              key={item.itemId}
              className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-gray-100">
                {itemImages[item.itemId] ? (
                  <Image
                    src={itemImages[item.itemId]}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xl font-medium text-gray-300">
                    {item.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-black">{item.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {item.description || "—"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              <span className="shrink-0 font-semibold text-black">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-1.5 border-t border-gray-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Subtotal</dt>
            <dd className="font-medium text-black">{formatCurrency(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Shipping</dt>
            <dd className="font-medium text-black">
              {formatCurrency(order.shippingCost)}
            </dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">
                Discount
                {order.promoCode && (
                  <span className="ml-1 uppercase">({order.promoCode})</span>
                )}
              </dt>
              <dd className="font-medium text-black">
                −{formatCurrency(order.discount)}
              </dd>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <dt className="font-medium text-black">Total</dt>
            <dd className="font-semibold text-black">
              {formatCurrency(order.totalPrice)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-2">
        <section className="border border-gray-200 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-widest text-black">
            Customer
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-black">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-black">{order.customerEmail}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-black">{order.customerPhone}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Address</dt>
              <dd className="font-medium text-black">
                {order.shippingAddress.line1},{" "}
                {order.shippingAddress.city},{" "}
                {order.shippingAddress.province},{" "}
                {order.shippingAddress.country}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Payment</dt>
              <dd className="font-medium text-black">Cash on Delivery</dd>
            </div>
          </dl>
        </section>

        <section className="border border-gray-200 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-widest text-black">
            Status
          </p>
          <p className="mt-1 text-sm capitalize text-gray-500">{status}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {STATUSES.map((option) => (
              <button
                key={option}
                onClick={() => void updateStatus(option)}
                disabled={updating !== null || option === status}
                className={`px-3 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors disabled:cursor-not-allowed ${
                  option === status
                    ? "bg-black text-white"
                    : "border border-gray-300 text-gray-600 hover:border-black hover:text-black"
                }`}
              >
                {updating === option ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  option
                )}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
