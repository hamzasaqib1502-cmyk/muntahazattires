import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getItemCoverImages, mapOrder } from "@/lib/data";
import { OrderDetail } from "@/components/admin/OrderDetail";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const order = mapOrder(data);
  const itemIds = [...new Set(order.items.map((item) => item.itemId))];
  const itemImages = await getItemCoverImages(itemIds);

  return <OrderDetail order={order} itemImages={itemImages} />;
}
