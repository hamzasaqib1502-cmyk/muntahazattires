import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("accounts")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = data?.role === "admin";
  }

  if (!isAdmin) redirect("/admin/login");

  const categories = await getCategories();

  return <AdminShell categories={categories}>{children}</AdminShell>;
}
