"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import type { Category } from "@/lib/types";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
};

export function MobileMenu({ open, onClose, categories }: MobileMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const container = containerRef.current;
    if (!container) return;

    const getFocusables = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );

    getFocusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = getFocusables();
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 cursor-pointer bg-black/40 animate-[fade-in_250ms_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-y-0 left-0 z-50 flex w-full flex-col bg-white shadow-xl animate-[slide-in-left_300ms_ease-out] md:w-[min(50%,30rem)]"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 sm:px-8">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="font-serif text-xl tracking-tight">
              Muntaha&apos;s Attires
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 text-black transition-colors hover:bg-gray-100"
          >
            <X className="h-7 w-7" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-9 sm:px-8 md:px-10">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-gray-500">
            Shop
          </p>
          <ul className="flex flex-col">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  onClick={onClose}
                  className="block border-b border-gray-200 py-4 font-sans text-xl font-medium tracking-wide text-gray-800 transition-colors duration-200 hover:text-black"
                >
                  {category.displayName}
                </Link>
              </li>
            ))}
          </ul>

          <a
            href="https://www.instagram.com/muntahazattire"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="mt-10 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-black"
          >
            <InstagramIcon className="h-5 w-5" />
            <span className="uppercase tracking-widest">Instagram</span>
          </a>
        </nav>
      </div>
    </>
  );
}
