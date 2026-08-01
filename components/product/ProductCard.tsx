import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Item } from "@/lib/types";

type ProductCardProps = {
  item: Item;
};

export function ProductCard({ item }: ProductCardProps) {
  const outOfStock = item.stock <= 0;

  return (
    <Link href={`/item/${item.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <Image
          src={item.images[0]}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {outOfStock && (
          <span className="absolute right-3 top-3 border border-white/60 bg-black/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white">
            Out of Stock
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16">
          {item.announcement && (
            <span className="mb-2 inline-flex items-center border border-white/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white/90">
              {item.announcement}
            </span>
          )}
          <h3 className="mt-2 text-sm font-bold uppercase tracking-wide text-white">
            {item.name}
          </h3>
          <p className="mt-1 font-sans text-sm font-semibold text-white">
            {formatCurrency(item.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}
