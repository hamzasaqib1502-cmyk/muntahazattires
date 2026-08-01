import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check } from "lucide-react";
import { getOrder } from "@/lib/data";
import { formatCurrency } from "@/lib/formatCurrency";

export const metadata: Metadata = {
  title: "Order Confirmed | Muntaha's Attires",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  if (!orderId) redirect("/");

  const order = await getOrder(orderId);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="border border-gray-200 p-8 text-center">
        <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black">
          <Check className="h-7 w-7 text-white" strokeWidth={2.5} />
        </p>
        <h1 className="mt-6 font-serif text-3xl text-black sm:text-4xl">
          Thank you — your order has been placed
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Order #{order.id} ·{" "}
          {new Date(order.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <section>
          <h2 className="text-sm font-medium uppercase tracking-widest text-black">
            Items
          </h2>
          <ul className="mt-4 space-y-3">
            {order.items.map((item) => (
              <li
                key={item.itemId}
                className="flex items-baseline justify-between gap-3 border-b border-gray-200 pb-3 text-sm"
              >
                <span className="text-gray-700">
                  {item.name}
                  <span className="ml-1 text-gray-400">× {item.quantity}</span>
                </span>
                <span className="font-medium text-black">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Shipping</dt>
              <dd className="font-medium text-black">
                {formatCurrency(order.shippingCost)}
              </dd>
            </div>
            {order.discount > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">
                  Discount
                  {order.promoCode && (
                    <span className="ml-1 uppercase tracking-wider">
                      ({order.promoCode})
                    </span>
                  )}
                </dt>
                <dd className="font-medium text-black">
                  −{formatCurrency(order.discount)}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-gray-200 pt-2">
              <dt className="font-medium uppercase tracking-widest text-black">
                Total
              </dt>
              <dd className="font-sans text-lg font-semibold text-black">
                {formatCurrency(order.totalPrice)}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-sm font-medium uppercase tracking-widest text-black">
            Delivery Details
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-black">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-black">{order.customerPhone}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Address</dt>
              <dd className="font-medium text-black">
                {order.shippingAddress.line1}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.province},{" "}
                {order.shippingAddress.country}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Payment</dt>
              <dd className="font-medium text-black">Cash on Delivery</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium capitalize text-black">
                {order.status}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/category/new-arrivals"
          className="bg-black px-8 py-3 text-center text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
        <Link
          href="/account"
          className="border border-black px-8 py-3 text-center text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-gray-100"
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
}
