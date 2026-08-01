import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/types";

type CategoryTeaserProps = {
  category: Category;
  reverse?: boolean;
};

export function CategoryTeaser({ category, reverse = false }: CategoryTeaserProps) {
  return (
    <section className="border-t border-gray-200 py-16 lg:py-24">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
        <Link
          href={`/category/${category.slug}`}
          aria-label={`Shop ${category.displayName}`}
          className={`group block overflow-hidden ${reverse ? "md:order-2" : ""}`}
        >
          <Image
            src={category.heroImage}
            alt={category.displayName}
            width={1200}
            height={900}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className={reverse ? "md:order-1" : ""}>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            {category.slug === "new-arrivals" ? "Just In" : "Collection"}
          </p>
          <Link href={`/category/${category.slug}`}>
            <h2 className="mt-3 font-serif text-4xl text-black transition-colors hover:text-gray-500 sm:text-5xl lg:text-6xl">
              {category.displayName}
            </h2>
          </Link>
          {category.heroCaption && (
            <p className="mt-4 max-w-md leading-7 text-gray-500">
              {category.heroCaption}
            </p>
          )}
          <Link
            href={`/category/${category.slug}`}
            className="mt-6 inline-flex items-center gap-2 border-b border-black pb-1 text-sm font-medium uppercase tracking-wide text-black transition-colors hover:border-gray-400 hover:text-gray-600"
          >
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
