import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getItems, getShippingRates } from "@/lib/data";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import type { Address } from "@/lib/types";

export const metadata: Metadata = {
  title: "Checkout | Muntaha's Attires",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let account: {
    firstName: string;
    lastName: string;
    phone: string;
    addresses: Address[];
  } | null = null;

  if (user) {
    const { data } = await supabase
      .from("accounts")
      .select("first_name,last_name,phone,addresses")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      account = {
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        phone: data.phone ?? "",
        addresses: data.addresses ?? [],
      };
    }
  }

  const [items, shippingRates] = await Promise.all([
    getItems(),
    getShippingRates(),
  ]);

  return (
    <CheckoutFlow
      initialEmail={user?.email ?? null}
      initialAccount={account}
      items={items}
      shippingRates={shippingRates}
    />
  );
}
