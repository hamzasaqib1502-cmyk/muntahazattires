"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

type CartState = {
  lines: CartLine[];
  addItem: (itemId: string, quantity: number) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addItem: (itemId, quantity) =>
        set((state) => {
          const existing = state.lines.find((l) => l.itemId === itemId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.itemId === itemId
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
            };
          }
          return { lines: [...state.lines, { itemId, quantity }] };
        }),
      setQuantity: (itemId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.itemId !== itemId)
              : state.lines.map((l) =>
                  l.itemId === itemId ? { ...l, quantity } : l,
                ),
        })),
      removeItem: (itemId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.itemId !== itemId),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "muntahas-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
