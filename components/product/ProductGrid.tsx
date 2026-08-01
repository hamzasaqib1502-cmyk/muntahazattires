import { ProductCard } from "@/components/product/ProductCard";
import type { Item } from "@/lib/types";

export function ProductGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
}
