import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, supabase, user } = await updateSession(request);

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin") && path !== "/admin/login";

  if (isAdminRoute) {
    let isAdmin = false;
    if (user) {
      const { data } = await supabase
        .from("accounts")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      isAdmin = data?.role === "admin";
    }

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*"],
};
