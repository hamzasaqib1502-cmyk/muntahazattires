import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { valid: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const code =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { code?: unknown }).code === "string"
      ? (body as { code: string }).code.trim().toUpperCase()
      : "";

  if (!code) {
    return NextResponse.json(
      { valid: false, message: "Enter a promo code." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("code,type,value")
    .eq("code", code)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({
      valid: false,
      message: "This promo code is not valid.",
    });
  }

  return NextResponse.json({ valid: true, ...data });
}
