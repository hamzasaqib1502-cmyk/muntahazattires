"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AddressForm } from "@/components/checkout/AddressForm";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Address, Order, OrderStatus } from "@/lib/types";

type Profile = {
  firstName: string;
  lastName: string;
  phone: string;
  addresses: Address[];
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AccountDashboard({
  account,
  email,
  orders,
}: {
  account: Profile;
  email: string;
  orders: Order[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState(account.firstName);
  const [lastName, setLastName] = useState(account.lastName);
  const [phone, setPhone] = useState(account.phone);
  const [addresses, setAddresses] = useState<Address[]>(account.addresses);
  const [addingAddress, setAddingAddress] = useState(false);
  const [draft, setDraft] = useState<Address>({
    line1: "",
    country: "",
    province: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const profileDirty =
    firstName.trim() !== account.firstName ||
    lastName.trim() !== account.lastName ||
    phone.trim() !== account.phone;

  async function saveProfile() {
    setSaving(true);
    setMessage(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("accounts")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setMessage({ kind: "error", text: error.message });
    } else {
      setMessage({ kind: "success", text: "Profile updated." });
      router.refresh();
    }
  }

  const addressValid =
    draft.line1.trim() !== "" &&
    draft.country !== "" &&
    draft.province.trim() !== "" &&
    draft.city.trim() !== "";

  async function saveAddress() {
    if (!addressValid) return;
    setMessage(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const next = [...addresses, draft];
    const { error } = await supabase
      .from("accounts")
      .update({ addresses: next })
      .eq("id", user.id);

    if (error) {
      setMessage({ kind: "error", text: error.message });
      return;
    }
    setAddresses(next);
    setAddingAddress(false);
    setDraft({ line1: "", country: "", province: "", city: "" });
    setMessage({ kind: "success", text: "Address saved." });
    router.refresh();
  }

  async function removeAddress(index: number) {
    setMessage(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const next = addresses.filter((_, i) => i !== index);
    const { error } = await supabase
      .from("accounts")
      .update({ addresses: next })
      .eq("id", user.id);

    if (error) {
      setMessage({ kind: "error", text: error.message });
      return;
    }
    setAddresses(next);
    setMessage({ kind: "success", text: "Address removed." });
    router.refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const sectionLabel =
    "text-xs font-medium uppercase tracking-widest text-gray-500";
  const inputClass =
    "w-full border border-gray-300 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none";

  return (
    <div>
      <header className="border-b border-gray-200 pb-8">
        <p className={sectionLabel}>My Account</p>
        <h1 className="mt-2 font-serif text-3xl text-black sm:text-4xl">
          {account.firstName
            ? `Welcome back, ${account.firstName}`
            : "My Account"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">{email}</p>
      </header>

      {message && (
        <div
          className={`mt-6 border px-4 py-3 text-sm ${
            message.kind === "error"
              ? "border-gray-300 text-gray-900"
              : "border-gray-200 text-gray-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <section className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-black">
              Profile
            </h2>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-gray-500 transition-colors hover:text-black"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
                  First Name
                </span>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
                  Last Name
                </span>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
                Phone Number
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0300 1234567"
                className={inputClass}
              />
            </label>
            <Button
              variant="primary"
              disabled={!profileDirty || saving}
              onClick={saveProfile}
            >
              {saving ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        </section>

        <section className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-black">
              Saved Addresses
            </h2>
            <button
              onClick={() => setAddingAddress((value) => !value)}
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-gray-500 transition-colors hover:text-black"
            >
              <Plus className="h-4 w-4" />
              Add address
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {addresses.length === 0 && !addingAddress ? (
              <p className="text-sm text-gray-500">
                No saved addresses yet.
              </p>
            ) : (
              addresses.map((address, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-4 border border-gray-200 px-4 py-3"
                >
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <span>
                      {address.line1}, {address.city}, {address.province},{" "}
                      {address.country}
                    </span>
                  </div>
                  <button
                    onClick={() => removeAddress(index)}
                    aria-label="Remove address"
                    className="p-1 text-gray-400 transition-colors hover:text-black"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}

            {addingAddress && (
              <div className="border border-gray-200 p-5">
                <AddressForm value={draft} onChange={setDraft} />
                <div className="mt-4 flex gap-3">
                  <Button
                    variant="primary"
                    disabled={!addressValid}
                    onClick={saveAddress}
                  >
                    Save Address
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setAddingAddress(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="mt-14 border-t border-gray-200 pt-8">
        <h2 className="text-sm font-medium uppercase tracking-widest text-black">
          Order History
        </h2>

        {orders.length === 0 ? (
          <div className="mt-5 border border-gray-200 px-5 py-10 text-center">
            <p className="text-sm text-gray-500">
              You haven&apos;t placed any orders yet.
            </p>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {orders.map((order) => {
              const open = expanded === order.id;
              return (
                <li key={order.id} className="border border-gray-200">
                  <button
                    onClick={() => setExpanded(open ? null : order.id)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.createdAt)} ·{" "}
                        {order.items.reduce(
                          (sum, line) => sum + line.quantity,
                          0,
                        )}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="text-xs font-medium uppercase tracking-widest text-gray-500">
                        {STATUS_LABELS[order.status]}
                      </span>
                      <span className="text-sm font-semibold text-black">
                        {formatCurrency(order.totalPrice)}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-gray-200 px-5 py-4">
                      <ul className="space-y-3">
                        {order.items.map((line) => (
                          <li
                            key={`${order.id}-${line.itemId}`}
                            className="flex items-start justify-between gap-4 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-black">
                                {line.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qty {line.quantity} ×{" "}
                                {formatCurrency(line.price)}
                              </p>
                            </div>
                            <p className="shrink-0 font-medium text-black">
                              {formatCurrency(line.price * line.quantity)}
                            </p>
                          </li>
                        ))}
                      </ul>

                      <dl className="mt-4 space-y-1.5 border-t border-gray-200 pt-4 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-gray-500">Subtotal</dt>
                          <dd className="text-black">
                            {formatCurrency(
                              order.items.reduce(
                                (sum, line) =>
                                  sum + line.price * line.quantity,
                                0,
                              ),
                            )}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-gray-500">Shipping</dt>
                          <dd className="text-black">
                            {formatCurrency(order.shippingCost)}
                          </dd>
                        </div>
                        {order.promoCode && (
                          <div className="flex justify-between gap-4">
                            <dt className="text-gray-500">
                              Promo ({order.promoCode})
                            </dt>
                            <dd className="text-black">
                              −{formatCurrency(order.discount)}
                            </dd>
                          </div>
                        )}
                        <div className="flex justify-between gap-4 border-t border-gray-200 pt-2">
                          <dt className="font-medium text-black">Total</dt>
                          <dd className="font-semibold text-black">
                            {formatCurrency(order.totalPrice)}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-4 border-t border-gray-200 pt-4 text-sm">
                        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
                          Deliver To
                        </p>
                        <p className="mt-2 text-gray-700">
                          {order.customerName} · {order.customerPhone}
                        </p>
                        <p className="text-gray-700">
                          {order.shippingAddress.line1},{" "}
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.province},{" "}
                          {order.shippingAddress.country}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Payment: Cash on Delivery
                        </p>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
