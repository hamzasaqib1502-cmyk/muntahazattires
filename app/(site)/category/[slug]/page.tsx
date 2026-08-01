import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageOpen } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getCategory, getItems } from "@/lib/data";
import type { Item } from "@/lib/types";

const SORTS = {
  "price-asc": (a: Item, b: Item) => a.price - b.price,
  "price-desc": (a: Item, b: Item) => b.price - a.price,
} as const;

type SortKey = keyof typeof SORTS;

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  return {
    title: category ? category.displayName : "Category",
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const [category, items] = await Promise.all([
    getCategory(slug),
    getItems(slug),
  ]);
  if (!category) notFound();

  const sortKey: SortKey | undefined =
    sort === "price-asc" || sort === "price-desc" ? sort : undefined;
  const sortedItems = sortKey ? [...items].sort(SORTS[sortKey]) : items;

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="border-b border-gray-200 pb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Collection
        </p>
        <h1 className="mt-2 font-serif text-3xl text-black sm:text-4xl">
          {category.displayName}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          {category.heroCaption ??
            `Explore the ${category.displayName} collection.`}
        </p>
      </header>

      {sortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-28 text-center">
          <PackageOpen className="h-12 w-12 text-gray-300" strokeWidth={1} />
          <h2 className="font-serif text-2xl text-black">
            Nothing here yet
          </h2>
          <p className="max-w-sm text-sm leading-6 text-gray-500">
            We&apos;re still adding pieces to this collection. Check back
            soon, or browse the rest of the shop.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center bg-black px-6 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-end py-6">
            <nav
              aria-label="Sort products"
              className="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-gray-500"
            >
              <span className="mr-2">Sort</span>
              <SortLink href={`/category/${slug}`} active={!sortKey}>
                Featured
              </SortLink>
              <SortLink
                href={`/category/${slug}?sort=price-asc`}
                active={sortKey === "price-asc"}
              >
                Price: Low to High
              </SortLink>
              <SortLink
                href={`/category/${slug}?sort=price-desc`}
                active={sortKey === "price-desc"}
              >
                Price: High to Low
              </SortLink>
            </nav>
          </div>
          <ProductGrid items={sortedItems} />
        </>
      )}
    </div>
  );
}

function SortLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`px-2 py-1 transition-colors ${
        active ? "bg-black text-white" : "hover:text-black"
      }`}
    >
      {children}
    </Link>
  );
}
