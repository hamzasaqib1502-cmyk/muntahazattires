"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

export type AppliedPromo = {
  code: string;
  type: "percent" | "flat";
  value: number;
};

export function PromoCodeInput({
  onApplied,
  onRemoved,
}: {
  onApplied: (promo: AppliedPromo) => void;
  onRemoved: () => void;
}) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<AppliedPromo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    const trimmed = code.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await response.json();

      if (data.valid) {
        const promo: AppliedPromo = {
          code: data.code,
          type: data.type,
          value: data.value,
        };
        setApplied(promo);
        setCode("");
        onApplied(promo);
      } else {
        setApplied(null);
        onRemoved();
        setError(data.message ?? "This promo code is not valid.");
      }
    } catch {
      setError("Could not validate the code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function remove() {
    setApplied(null);
    setError(null);
    onRemoved();
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between border border-gray-200 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-medium text-black">
          <Check className="h-4 w-4" />
          {applied.code} applied
        </p>
        <button
          onClick={remove}
          aria-label="Remove promo code"
          className="p-1 text-gray-500 transition-colors hover:text-black"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              apply();
            }
          }}
          placeholder="Promo code"
          aria-label="Promo code"
          className="flex-1 border border-gray-300 bg-white px-4 py-3 text-sm uppercase tracking-widest text-black placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-400 focus:border-black focus:outline-none"
        />
        <button
          onClick={apply}
          disabled={!code.trim() || loading}
          className="border border-black px-5 py-3 text-xs font-medium uppercase tracking-widest text-black transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white"
        >
          {loading ? "Checking…" : "Apply"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
