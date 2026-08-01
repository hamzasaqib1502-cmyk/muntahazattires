import { createClient } from "@/lib/supabase/server";
import { getItemCoverImages, mapOrder } from "@/lib/data";
import { ManageOrders } from "@/components/admin/ManageOrders";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const orders = (data ?? []).map(mapOrder);
  const itemIds = [
    ...new Set(orders.flatMap((order) => order.items.map((item) => item.itemId))),
  ];
  const itemImages = await getItemCoverImages(itemIds);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Fulfillment
        </p>
        <h1 className="mt-2 font-serif text-3xl text-black">Orders</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          Review customer details and line items, and update order status. Click
          an order to open its full details.
        </p>
      </header>

      <ManageOrders initial={orders} itemImages={itemImages} />
    </div>
  );
}
