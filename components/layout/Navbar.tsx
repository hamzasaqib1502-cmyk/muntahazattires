"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { createClient } from "@/lib/supabase/client";
import type { Category, Item } from "@/lib/types";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { CartWidget } from "@/components/cart/CartWidget";

type NavbarProps = {
  categories: Category[];
  items: Item[];
  userFirstName?: string | null;
};

export function Navbar({
  categories,
  items,
  userFirstName = null,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lines = useCartStore((state) => state.lines);
  const cartCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY >= window.innerHeight - 64);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const isOverHero = pathname === "/" && !scrolled;
  const navTextColor = isOverHero ? "text-white" : "text-black";
  const navHover = isOverHero ? "hover:bg-white/10" : "hover:bg-gray-100";

  return (
    <header
      className={`sticky top-0 z-40 h-16 border-b transition-colors duration-300 ${
        isOverHero
          ? "border-transparent bg-transparent"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="relative flex h-full items-center gap-4 px-8">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className={`p-[5px] transition-colors ${navTextColor} ${navHover}`}
        >
          <Menu className="h-7 w-7" />
        </button>

        <Link
          href="/"
          className={`flex items-center gap-2 p-[5px] ${navTextColor}`}
          aria-label="Muntaha's Attires — home"
        >
          <span
            className={`flex items-center justify-center rounded-full bg-white ${
              isOverHero ? "h-10 w-10 sm:h-14 sm:w-14" : "h-14 w-14"
            }`}
          >
            <Image
              src="/logo.png"
              alt=""
              width={48}
              height={48}
              className={`object-contain ${
                isOverHero ? "h-8 w-8 sm:h-12 sm:w-12" : "h-12 w-12"
              }`}
            />
          </span>
          <span className="hidden font-serif text-2xl tracking-tight sm:inline">
            Muntaha&apos;s Attires
          </span>
        </Link>

        <div className="flex-1" />

        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className={`p-[5px] transition-colors ${navTextColor} ${navHover}`}
        >
          <Search className="h-7 w-7" />
        </button>

        <button
          onClick={() => setCartOpen(true)}
          aria-label={`Open bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
          className={`relative p-[5px] transition-colors ${navTextColor} ${navHover}`}
        >
          <ShoppingCart className="h-7 w-7" />
          {cartCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
              {cartCount}
            </span>
          )}
        </button>

        <SignInButton
          firstName={userFirstName}
          navTextColor={navTextColor}
          navHover={navHover}
        />

        {searchOpen && (
          <SearchBox items={items} onClose={() => setSearchOpen(false)} />
        )}
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
      />

      <CartWidget
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
      />
    </header>
  );
}

function SearchBox({
  items,
  onClose,
}: {
  items: Item[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const trimmed = query.trim().toLowerCase();
  const matches = trimmed
    ? items
        .filter((item) => item.name.toLowerCase().includes(trimmed))
        .slice(0, 8)
    : [];

  return (
    <>
      <div
        className="fixed inset-0 z-30 cursor-pointer bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute left-0 right-0 top-full z-40 border-b border-gray-200 bg-white px-4 py-6 shadow-lg sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-xl">
          <div className="flex items-center gap-2 border-b border-gray-300 pb-2 focus-within:border-black">
            <Search className="h-5 w-5 text-gray-500" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search items…"
              aria-label="Search items"
              className="flex-1 bg-transparent text-sm text-black placeholder:text-gray-400 focus:outline-none"
            />
            <button
              onClick={onClose}
              aria-label="Close search"
              className="p-1 text-gray-500 transition-colors hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {trimmed && (
            <div className="absolute left-0 right-0 top-full mt-2 border border-gray-200 bg-white shadow-lg">
              {matches.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-500">
                  No items match &ldquo;{query}&rdquo;
                </p>
              ) : (
                <ul className="max-h-80 overflow-y-auto">
                  {matches.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/item/${item.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-100"
                      >
                        <span className="text-sm font-medium text-black">
                          {item.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SignInButton({
  firstName,
  navTextColor,
  navHover,
}: {
  firstName?: string | null;
  navTextColor: string;
  navHover: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!firstName) {
    return (
      <Link
        href="/account"
        className={`flex items-center gap-1.5 p-[5px] text-lg font-medium uppercase tracking-wide transition-colors ${navTextColor} ${navHover}`}
      >
        <User className="h-7 w-7" />
        <span className="hidden md:inline">Sign In</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-1.5 p-[5px] text-lg font-medium uppercase tracking-wide transition-colors ${navTextColor} ${navHover}`}
      >
        <User className="h-7 w-7" />
        <span className="hidden md:inline">{firstName}</span>
        <ChevronDown className="hidden h-6 w-6 md:inline" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10 cursor-pointer"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-48 border border-gray-200 bg-white shadow-lg"
          >
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-black transition-colors hover:bg-gray-100"
            >
              Orders
            </Link>
            <button
              role="menuitem"
              onClick={handleSignOut}
              className="block w-full px-4 py-3 text-left text-sm text-black transition-colors hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
