import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AccountSignIn } from "@/components/account/AccountSignIn";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import type { Address, Order, OrderStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "My Account | Muntaha's Attires",
};

type AccountRow = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  addresses: Address[] | null;
};

type OrderRow = {
  id: string;
  account_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Address;
  items: Order["items"];
  shipping_cost: number;
  promo_code: string | null;
  discount: number;
  total_price: number;
  payment_method: "COD";
  status: OrderStatus;
  created_at: string;
};

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    accountId: row.account_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address,
    items: row.items,
    shippingCost: row.shipping_cost,
    promoCode: row.promo_code,
    discount: row.discount,
    totalPrice: row.total_price,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
  };
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AccountSignIn />;
  }

  const [accountResult, ordersResult] = await Promise.all([
    supabase
      .from("accounts")
      .select("first_name,last_name,phone,addresses")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("*")
      .eq("account_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const row = accountResult.data as AccountRow | null;
  const account = {
    firstName: row?.first_name ?? "",
    lastName: row?.last_name ?? "",
    phone: row?.phone ?? "",
    addresses: row?.addresses ?? [],
  };
  const orders = (ordersResult.data as OrderRow[] | null)?.map(mapOrder) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <AccountDashboard account={account} email={user.email ?? ""} orders={orders} />
    </div>
  );
}
