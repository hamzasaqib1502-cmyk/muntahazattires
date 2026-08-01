import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkoutRequestSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { shippingAddress, lines, shippingCost, promoCode } = parsed.data;

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("first_name,last_name,email,phone")
    .eq("id", user.id)
    .maybeSingle();

  if (accountError) {
    return NextResponse.json({ error: accountError.message }, { status: 500 });
  }

  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 400 });
  }

  if (!account.phone) {
    return NextResponse.json(
      { error: "A phone number is required to place an order." },
      { status: 400 },
    );
  }

  const ids = lines.map((line) => line.itemId);
  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("*")
    .in("id", ids);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const orderItems: {
    itemId: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
  }[] = [];

  for (const line of lines) {
    const item = items?.find((i) => i.id === line.itemId);
    if (!item) {
      return NextResponse.json(
        { error: `Item ${line.itemId} is no longer available.` },
        { status: 400 },
      );
    }
    if (item.stock < line.quantity) {
      return NextResponse.json(
        { error: `Not enough stock for "${item.name}".` },
        { status: 400 },
      );
    }
    orderItems.push({
      itemId: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: line.quantity,
    });
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  let discount = 0;
  let promoCodeUsed: string | null = null;

  if (promoCode) {
    const admin = createAdminClient();
    const { data: promo, error: promoError } = await admin
      .from("promo_codes")
      .select("code,type,value")
      .eq("code", promoCode)
      .eq("active", true)
      .maybeSingle();

    if (promoError) {
      return NextResponse.json({ error: promoError.message }, { status: 500 });
    }

    if (!promo) {
      return NextResponse.json(
        { error: "Invalid promo code." },
        { status: 400 },
      );
    }

    promoCodeUsed = promo.code;
    discount =
      promo.type === "percent"
        ? Math.round((subtotal * promo.value) / 100)
        : Math.min(promo.value, subtotal);
  }

  const { data: order, error: orderError } = await supabase.rpc("place_order", {
    p_account_id: user.id,
    p_customer_name: `${account.first_name} ${account.last_name}`.trim(),
    p_customer_email: account.email,
    p_customer_phone: account.phone,
    p_shipping_address: shippingAddress,
    p_items: orderItems,
    p_shipping_cost: shippingCost,
    p_promo_code: promoCodeUsed,
    p_discount: discount,
  });

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 400 });
  }

  return NextResponse.json({ order }, { status: 201 });
}
