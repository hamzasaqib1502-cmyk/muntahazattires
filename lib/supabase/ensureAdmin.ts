import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let ensured = false;

export type EnsureAdminStatus =
  | "not-configured"
  | "invalid-email"
  | "invalid-password"
  | "lookup-failed"
  | "update-failed"
  | "create-failed"
  | "ready"
  | "created";

// Creates (or promotes) the admin account defined by ADMIN_EMAIL and
// ADMIN_PASSWORD in the environment (e.g. .env.local). Runs once per process
// on the admin login page so Muntaha can sign in with her predefined
// credentials without any manual setup. The operation is idempotent: it never
// creates a duplicate user and never demotes an existing admin.
export async function ensureAdmin(): Promise<EnsureAdminStatus> {
  if (ensured) return "ready";

  const email = (process.env.ADMIN_EMAIL ?? "")
    .replace(/^["']|["']$/g, "")
    .trim()
    .toLowerCase();
  const password = (process.env.ADMIN_PASSWORD ?? "").replace(/^["']|["']$/g, "");

  if (!email || !password) {
    ensured = true;
    return "not-configured";
  }

  if (!EMAIL_PATTERN.test(email)) {
    console.error(
      "[ensureAdmin] ADMIN_EMAIL is not a valid email address — skipping admin setup.",
    );
    ensured = true;
    return "invalid-email";
  }
  if (password.length < 6) {
    console.error(
      "[ensureAdmin] ADMIN_PASSWORD must be at least 6 characters — skipping admin setup.",
    );
    ensured = true;
    return "invalid-password";
  }

  const supabase = createAdminClient();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const lookup = await fetch(
    `${baseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    },
  );
  if (!lookup.ok) {
    console.error(
      "[ensureAdmin] Could not look up admin user:",
      lookup.status,
    );
    ensured = true;
    return "lookup-failed";
  }
  const body = await lookup.json().catch(() => null);
  const users = Array.isArray(body) ? body : body?.users;
  const existing = users?.[0] as { id: string } | undefined;

  let userId: string;

  if (existing) {
    const update = await fetch(`${baseUrl}/auth/v1/admin/users/${existing.id}`, {
      method: "PUT",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        email_confirm: true,
        user_metadata: { first_name: "Muntaha", last_name: "Attires" },
      }),
    });
    if (!update.ok) {
      console.error("[ensureAdmin] Could not update admin user:", update.status);
      ensured = true;
      return "update-failed";
    }
    userId = existing.id;
  } else {
    const create = await fetch(`${baseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name: "Muntaha", last_name: "Attires" },
      }),
    });
    const created = await create.json().catch(() => null);
    if (!create.ok || !created?.id) {
      console.error(
        "[ensureAdmin] Could not create admin user:",
        create.status,
        JSON.stringify(created),
      );
      ensured = true;
      return "create-failed";
    }
    userId = created.id;
  }

  const { data: row } = await supabase
    .from("accounts")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (row) {
    await supabase.from("accounts").update({ role: "admin" }).eq("id", userId);
  } else {
    await supabase.from("accounts").insert({
      id: userId,
      email,
      first_name: "Muntaha",
      last_name: "Attires",
      phone: "",
      role: "admin",
      addresses: [],
    });
  }

  ensured = true;
  return existing ? "ready" : "created";
}
