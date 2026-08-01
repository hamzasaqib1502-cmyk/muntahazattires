"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Order } from "@/lib/types";

export function ManageOrders({
  initial,
  itemImages = {},
}: {
  initial: Order[];
  itemImages?: Record<string, string>;
}) {
  return (
    <section className="border border-gray-200 bg-white p-6">
      <h2 className="text-sm font-medium uppercase tracking-widest text-black">
        All Orders
      </h2>

      {initial.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          No orders yet. New orders from the storefront appear here.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-gray-200">
          {initial.map((order) => {
            const firstItem = order.items[0];
            const coverImage =
              firstItem && itemImages[firstItem.itemId]
                ? itemImages[firstItem.itemId]
                : null;
            return (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="group flex w-full items-center gap-4 py-4 text-left"
                >
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-gray-100">
                    {coverImage ? (
                      <Image
                        src={coverImage}
                        alt={firstItem?.name ?? "Order item"}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-lg font-medium text-gray-300">
                        {firstItem?.name.charAt(0) ?? "#"}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-black group-hover:underline">
                      {order.customerName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="font-semibold text-black">
                      {formatCurrency(order.totalPrice)}
                    </span>
                    <span className="hidden text-xs uppercase tracking-widest text-gray-500 sm:inline">
                      {order.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-black" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
