"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/useCartStore";
import { AuthPanel } from "@/components/checkout/AuthPanel";
import { AddressForm } from "@/components/checkout/AddressForm";
import { PromoCodeInput, type AppliedPromo } from "@/components/checkout/PromoCodeInput";
import { ShippingSummary, type SummaryEntry } from "@/components/checkout/ShippingSummary";
import type { Address, Item, ShippingRate } from "@/lib/types";

type AccountInfo = {
  firstName: string;
  lastName: string;
  phone: string;
  addresses: Address[];
};

export function CheckoutFlow({
  initialEmail,
  initialAccount,
  items,
  shippingRates,
}: {
  initialEmail: string | null;
  initialAccount: AccountInfo | null;
  items: Item[];
  shippingRates: ShippingRate[];
}) {
  const router = useRouter();
  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clear);

  const [sessionEmail, setSessionEmail] = useState<string | null>(initialEmail);
  const [account, setAccount] = useState<AccountInfo | null>(initialAccount);
  const [phone, setPhone] = useState(initialAccount?.phone ?? "");
  const [address, setAddress] = useState<Address>({
    line1: "",
    country: "",
    province: "",
    city: "",
  });
  const [saveAddress, setSaveAddress] = useState(false);
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemById = new Map(items.map((item) => [item.id, item]));
  const entries: SummaryEntry[] = lines
    .map((line) => ({ line, item: itemById.get(line.itemId) }))
    .filter(
      (entry): entry is { line: (typeof lines)[number]; item: Item } =>
        entry.item !== undefined,
    )
    .map(({ line, item }) => ({ item, quantity: line.quantity }));
  const subtotal = entries.reduce(
    (sum, entry) => sum + entry.item.price * entry.quantity,
    0,
  );

  const shippingCost = address.country
    ? (shippingRates.find(
        (rate) =>
          rate.country === address.country &&
          rate.province === address.province,
      )?.cost ??
      shippingRates.find(
        (rate) =>
          rate.country === address.country && rate.province == null,
      )?.cost ??
      null)
    : null;
  const shippingUnavailable = address.country !== "" && shippingCost === null;

  const discount = promo
    ? promo.type === "percent"
      ? Math.round((subtotal * promo.value) / 100)
      : Math.min(promo.value, subtotal)
    : 0;
  const total = subtotal + (shippingCost ?? 0) - discount;

  async function refreshSession() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setSessionEmail(user.email ?? "");
    const { data } = await supabase
      .from("accounts")
      .select("first_name,last_name,phone,addresses")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      const next: AccountInfo = {
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        phone: data.phone ?? "",
        addresses: data.addresses ?? [],
      };
      setAccount(next);
      if (!next.phone) setPhone("");
    }
  }

  const addressValid =
    address.line1.trim() !== "" &&
    address.country !== "" &&
    address.province.trim() !== "" &&
    address.city.trim() !== "";
  const canPlace =
    addressValid && shippingCost !== null && phone.trim() !== "" && entries.length > 0;

  async function placeOrder() {
    if (!canPlace || submitting) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Please sign in again before placing your order.");
      setSubmitting(false);
      return;
    }

    if (account && phone.trim() !== account.phone) {
      await supabase
        .from("accounts")
        .update({ phone: phone.trim() })
        .eq("id", user.id);
    }

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingAddress: address,
        lines: entries.map(({ item, quantity }) => ({
          itemId: item.id,
          quantity,
        })),
        shippingCost,
        promoCode: promo?.code ?? null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Something went wrong placing your order.");
      setSubmitting(false);
      return;
    }

    if (account && saveAddress) {
      const duplicate = account.addresses.some(
        (saved) =>
          saved.line1 === address.line1 &&
          saved.city === address.city &&
          saved.province === address.province &&
          saved.country === address.country,
      );
      if (!duplicate) {
        await supabase
          .from("accounts")
          .update({ addresses: [...account.addresses, address] })
          .eq("id", user.id);
      }
    }

    clearCart();
    router.push(`/checkout/success?order=${data.order.id}`);
  }

  if (!sessionEmail) {
    return (
      <div className="px-4 py-14 sm:px-6">
        <AuthPanel onAuthenticated={refreshSession} />
      </div>
    );
  }

  const inputClass =
    "w-full border border-gray-300 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none";

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="border-b border-gray-200 pb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Checkout
        </p>
        <h1 className="mt-2 font-serif text-3xl text-black sm:text-4xl">
          {account && account.firstName
            ? `Welcome back, ${account.firstName}`
            : "Complete your order"}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          {sessionEmail} — items are only reserved once your order is placed.
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
        <div className="min-w-0">
          {!account || account.phone === "" ? (
            <section className="mb-10 border border-gray-200 p-6">
              <h2 className="text-sm font-medium uppercase tracking-widest text-black">
                Phone Number (required)
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                We need a phone number to confirm and deliver your order.
              </p>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0300 1234567"
                className={`${inputClass} mt-4`}
              />
            </section>
          ) : (
            <section className="mb-10 border border-gray-200 p-6">
              <h2 className="text-sm font-medium uppercase tracking-widest text-black">
                Contact
              </h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-500">Name</dt>
                  <dd className="font-medium text-black">
                    {account.firstName} {account.lastName}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="font-medium text-black">
                    {phone || account.phone || "—"}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          <section className="mb-10">
            <h2 className="mb-5 text-sm font-medium uppercase tracking-widest text-black">
              Shipping Address
            </h2>
            <AddressForm
              value={address}
              onChange={setAddress}
              savedAddresses={account?.addresses.length ? account.addresses : undefined}
              onPickSaved={
                account?.addresses.length
                  ? (saved) => setAddress(saved)
                  : undefined
              }
            />
            {account && (
              <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(event) => setSaveAddress(event.target.checked)}
                  className="h-4 w-4 accent-black"
                />
                Save this address to my account
              </label>
            )}
          </section>

          <section className="mb-10">
            <h2 className="mb-5 text-sm font-medium uppercase tracking-widest text-black">
              Promo Code
            </h2>
            <PromoCodeInput
              onApplied={(next) => setPromo(next)}
              onRemoved={() => setPromo(null)}
            />
          </section>
        </div>

        <ShippingSummary
          entries={entries}
          subtotal={subtotal}
          shippingCost={shippingCost ?? 0}
          shippingUnavailable={shippingUnavailable}
          discount={discount}
          promoCode={promo?.code ?? null}
          total={total}
          submitting={submitting}
          error={error}
          onSubmit={placeOrder}
        />
      </div>

      {!addressValid || shippingCost === null || phone.trim() === "" ? (
        <p className="mt-6 text-sm text-gray-500">
          Fill in your phone number and shipping address to see shipping cost
          and place your order.
        </p>
      ) : null}
    </div>
  );
}
