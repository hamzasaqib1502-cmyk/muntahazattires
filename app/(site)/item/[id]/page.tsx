import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { getCategory, getItem } from "@/lib/data";
import { formatCurrency } from "@/lib/formatCurrency";

type ItemPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ItemPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  return {
    title: item ? item.name : "Item not found",
  };
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;

  const item = await getItem(id);
  if (!item) notFound();

  const category = await getCategory(item.categorySlug);

  const stockLabel =
    item.stock === 0
      ? "Out of stock"
      : item.stock === 1
        ? "In stock — only 1 left"
        : `In stock — ${item.stock} left`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 text-xs font-medium uppercase tracking-widest text-gray-500"
      >
        <Link href="/" className="transition-colors hover:text-black">
          Home
        </Link>
        {category && (
          <>
            <span className="mx-2 text-gray-300">/</span>
            <Link
              href={`/category/${category.slug}`}
              className="transition-colors hover:text-black"
            >
              {category.displayName}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductCarousel images={item.images} name={item.name} />

        <div className="lg:py-6">
          <h1 className="font-serif text-3xl text-black sm:text-4xl">
            {item.name}
          </h1>

          <p className="mt-5 font-sans text-2xl font-semibold text-black">
            {formatCurrency(item.price)}
          </p>

          <p
            className={`mt-4 flex items-center gap-2 text-sm ${
              item.stock === 0 ? "text-gray-500" : "text-gray-700"
            }`}
          >
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                item.stock === 0 ? "bg-gray-400" : "bg-black"
              }`}
              aria-hidden="true"
            />
            {stockLabel}
          </p>

          {item.announcement && (
            <p className="mt-5 inline-block border border-gray-300 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-gray-600">
              {item.announcement}
            </p>
          )}

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-sm leading-7 text-gray-600">
              {item.description}
            </p>
          </div>

          <AddToCart itemId={item.id} name={item.name} stock={item.stock} />

          <p className="mt-6 border-t border-gray-200 pt-5 text-xs leading-5 text-gray-500">
            Cash on delivery available across Pakistan. Every order is
            quality-checked before it ships.
          </p>
        </div>
      </div>
    </div>
  );
}
