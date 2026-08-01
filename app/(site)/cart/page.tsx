import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { getItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Your Bag | Muntaha's Attires",
};

export default async function CartPage() {
  const items = await getItems();
  return <CartView items={items} />;
}
