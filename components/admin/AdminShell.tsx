"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardList, LayoutDashboard, LogOut, Menu, Settings, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon?: typeof LayoutDashboard;
};

export function AdminShell({
  categories,
  children,
}: {
  categories: Category[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  const nav: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ClipboardList },
    ...categories.map((category) => ({
      href: `/admin/category/${category.slug}`,
      label: category.displayName,
    })),
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const sidebar = (
    <nav className="flex h-full flex-col gap-1" aria-label="Admin navigation">
      <p className="px-4 pb-2 pt-6 text-xs font-medium uppercase tracking-widest text-gray-400">
        Catalog
      </p>
      {nav.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              active
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-black"
            }`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.label}
          </Link>
        );
      })}

      <div className="mt-auto border-t border-gray-200 p-4">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 px-2 py-2 text-sm text-gray-700 transition-colors hover:text-black"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle admin menu"
            className="p-1 text-black lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/admin" className="text-sm font-medium uppercase tracking-widest text-black">
            Muntaha&apos;s Attires — Admin
          </Link>
        </div>
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-widest text-gray-500 transition-colors hover:text-black"
        >
          View store →
        </Link>
      </div>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white lg:block">
          <div className="sticky top-0 h-screen">{sidebar}</div>
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
              {sidebar}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
