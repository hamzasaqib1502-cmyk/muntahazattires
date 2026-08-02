"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const selected = options.find((option) => option === value) ?? null;

  function handleTriggerKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (open) {
        setHighlighted((h) => Math.min(h + 1, options.length - 1));
      } else {
        setHighlighted(0);
        setOpen(true);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (open) setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open && options[highlighted]) {
        onChange(options[highlighted]);
        setOpen(false);
      } else {
        setHighlighted(0);
        setOpen(true);
      }
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={handleTriggerKeyDown}
        className="flex w-full items-center justify-between gap-2 border border-gray-300 bg-white px-4 py-3 text-left text-sm focus:border-black focus:outline-none"
      >
        <span className={selected ? "text-black" : "text-gray-400"}>
          {selected ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto border border-gray-200 bg-white shadow-lg"
        >
          {options.map((option, index) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                onMouseEnter={() => setHighlighted(index)}
                className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors ${
                  index === highlighted ? "bg-gray-100" : ""
                }`}
              >
                {option}
                {option === value && <Check className="h-4 w-4 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
