import type { Metadata } from "next";
import { ensureAdmin } from "@/lib/supabase/ensureAdmin";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Sign In | Muntaha's Attires",
};

// Runs per request (not prerendered at build time) so ensureAdmin() picks up
// ADMIN_EMAIL / ADMIN_PASSWORD from the runtime environment.
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  await ensureAdmin();
  return <AdminLoginForm />;
}
