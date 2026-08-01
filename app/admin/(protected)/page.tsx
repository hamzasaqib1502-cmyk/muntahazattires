import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: itemCount }, { count: orderCount }, { data: newOrders }, { data: lowStock }, { data: recentOrders }] =
    await Promise.all([
      supabase.from("items").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("id")
        .eq("status", "placed")
        .limit(1),
      supabase
        .from("items")
        .select("id,name,stock")
        .lt("stock", 5)
        .order("stock")
        .limit(8),
      supabase
        .from("orders")
        .select("id,customer_name,total_price,status,created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const placedCount = newOrders?.length ?? 0;

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Overview
        </p>
        <h1 className="mt-2 font-serif text-3xl text-black">Dashboard</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            Products
          </p>
          <p className="mt-2 font-sans text-3xl font-semibold text-black">
            {itemCount}
          </p>
        </div>
        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            Total Orders
          </p>
          <p className="mt-2 font-sans text-3xl font-semibold text-black">
            {orderCount}
          </p>
        </div>
        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            New Orders
          </p>
          <p className="mt-2 font-sans text-3xl font-semibold text-black">
            {placedCount}
          </p>
          <Link
            href="/admin/orders"
            className="mt-3 inline-block text-xs font-medium uppercase tracking-widest text-black underline decoration-gray-300 underline-offset-4 hover:decoration-black"
          >
            Manage orders →
          </Link>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-medium uppercase tracking-widest text-black">
            Recent Orders
          </h2>
          {recentOrders && recentOrders.length > 0 ? (
            <ul className="mt-4 divide-y divide-gray-200 border border-gray-200 bg-white">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="group flex items-center justify-between gap-4 px-5 py-4 text-sm transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-black group-hover:underline">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">
                        {formatCurrency(order.total_price)}
                      </p>
                      <p className="text-xs capitalize text-gray-500">
                        {order.status}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 border border-gray-200 bg-white px-5 py-8 text-sm text-gray-500">
              No orders yet.
            </p>
          )}
        </section>

        <section>
          <h2 className="text-sm font-medium uppercase tracking-widest text-black">
            Low Stock
          </h2>
          {lowStock && lowStock.length > 0 ? (
            <ul className="mt-4 divide-y divide-gray-200 border border-gray-200 bg-white">
              {lowStock.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
                >
                  <p className="truncate font-medium text-black">{item.name}</p>
                  <p className="shrink-0 text-xs text-gray-500">
                    {item.stock} left
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 border border-gray-200 bg-white px-5 py-8 text-sm text-gray-500">
              All products are well stocked.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
