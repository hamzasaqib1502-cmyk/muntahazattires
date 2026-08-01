"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Could not sign in.");
      setStatus("idle");
      return;
    }

    const { data: account } = await supabase
      .from("accounts")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (account?.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      setStatus("idle");
      return;
    }

    router.push("/admin");
  }

  const inputClass =
    "w-full border border-gray-300 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm border border-gray-200 bg-white p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Muntaha&apos;s Attires
        </p>
        <h1 className="mt-2 font-serif text-3xl text-black">Admin Sign In</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Restricted area. Authorized staff only.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
              Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-black px-6 py-3.5 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
