import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import type { Category } from "@/lib/types";

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="col-span-2 flex flex-col gap-4 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="font-serif text-lg">Muntaha&apos;s Attires</span>
          </Link>
          <p className="max-w-xs text-sm leading-6 text-gray-500">
            Traditional Pakistani clothing for women.
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-gray-500">
            Shop
          </p>
          <ul className="flex flex-col gap-2.5">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="text-sm text-gray-700 transition-colors hover:text-black"
                >
                  {category.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-gray-500">
            Customer Care
          </p>
          <ul className="flex flex-col gap-2.5">
            <li>
              <Link
                href="/account"
                className="text-sm text-gray-700 transition-colors hover:text-black"
              >
                My Account
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="text-sm text-gray-700 transition-colors hover:text-black"
              >
                View Bag
              </Link>
            </li>
            <li>
              <Link
                href="/checkout"
                className="text-sm text-gray-700 transition-colors hover:text-black"
              >
                Checkout
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-gray-500">
            Follow Us
          </p>
          <a
            href="https://www.instagram.com/muntahazattire"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-black"
          >
            <InstagramIcon className="h-4 w-4" />
            Instagram
          </a>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Muntaha&apos;s Attires. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
