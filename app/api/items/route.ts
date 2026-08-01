import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();

  const supabase = await createClient();
  let query = supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category_slug", category);
  }

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
