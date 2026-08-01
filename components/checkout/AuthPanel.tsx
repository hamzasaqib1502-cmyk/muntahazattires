"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthPanel({
  onAuthenticated,
  eyebrow = "Checkout",
  signInHint = "Sign in to continue to your order.",
}: {
  onAuthenticated: () => Promise<void>;
  eyebrow?: string;
  signInHint?: string;
}) {
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signin, setSignin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    const email = signin.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setMessage({ kind: "error", text: "Please enter a valid email address." });
      setStatus("idle");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: signin.password,
    });
    if (error) {
      setMessage({ kind: "error", text: error.message });
      setStatus("idle");
      return;
    }
    await onAuthenticated();
    setStatus("idle");
  }

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    const email = signup.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setMessage({ kind: "error", text: "Please enter a valid email address." });
      setStatus("idle");
      return;
    }
    if (signup.password.length < 6) {
      setMessage({
        kind: "error",
        text: "Password must be at least 6 characters.",
      });
      setStatus("idle");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: signup.password,
      options: {
        data: {
          first_name: signup.firstName.trim(),
          last_name: signup.lastName.trim(),
          phone: signup.phone.trim(),
        },
      },
    });

    if (error) {
      setMessage({ kind: "error", text: error.message });
      setStatus("idle");
      return;
    }

    if (data.session) {
      await onAuthenticated();
      setStatus("idle");
      return;
    }

    setStatus("done");
  }

  const inputClass =
    "w-full border border-gray-300 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none";

  return (
    <div className="mx-auto w-full max-w-md border border-gray-200 bg-white p-8">
      <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-serif text-3xl text-black">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-gray-500">
        {mode === "signin"
          ? signInHint
          : "Create an account to place your order. We only use your email to identify you and keep you signed in."}
      </p>

      <div className="mt-6 flex border border-gray-200">
        <button
          onClick={() => {
            setMode("signin");
            setMessage(null);
          }}
          aria-pressed={mode === "signin"}
          className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-widest transition-colors ${
            mode === "signin"
              ? "bg-black text-white"
              : "bg-white text-gray-500 hover:text-black"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setMode("signup");
            setMessage(null);
          }}
          aria-pressed={mode === "signup"}
          className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-widest transition-colors ${
            mode === "signup"
              ? "bg-black text-white"
              : "bg-white text-gray-500 hover:text-black"
          }`}
        >
          Create Account
        </button>
      </div>

      {status === "done" ? (
        <div className="mt-6 border border-gray-200 p-5">
          <p className="text-sm leading-6 text-gray-700">
            Your account has been created. Sign in to continue.
          </p>
        </div>
      ) : mode === "signin" ? (
        <form onSubmit={handleSignIn} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
              Email
            </span>
            <input
              type="email"
              required
              value={signin.email}
              onChange={(event) =>
                setSignin({ ...signin, email: event.target.value })
              }
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
              value={signin.password}
              onChange={(event) =>
                setSignin({ ...signin, password: event.target.value })
              }
              placeholder="••••••••"
              className={inputClass}
            />
          </label>

          {message && (
            <p
              className={`text-sm ${
                message.kind === "error" ? "text-red-600" : "text-gray-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-black px-6 py-4 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Signing in…" : "Sign In"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
                First Name
              </span>
              <input
                required
                value={signup.firstName}
                onChange={(event) =>
                  setSignup({ ...signup, firstName: event.target.value })
                }
                placeholder="Muntaha"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
                Last Name
              </span>
              <input
                required
                value={signup.lastName}
                onChange={(event) =>
                  setSignup({ ...signup, lastName: event.target.value })
                }
                placeholder="Ahmed"
                className={inputClass}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
              Email
            </span>
            <input
              type="email"
              required
              value={signup.email}
              onChange={(event) =>
                setSignup({ ...signup, email: event.target.value })
              }
              placeholder="you@example.com"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
              Phone Number
            </span>
            <input
              type="tel"
              required
              value={signup.phone}
              onChange={(event) =>
                setSignup({ ...signup, phone: event.target.value })
              }
              placeholder="0300 1234567"
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
              minLength={6}
              value={signup.password}
              onChange={(event) =>
                setSignup({ ...signup, password: event.target.value })
              }
              placeholder="At least 6 characters"
              className={inputClass}
            />
          </label>

          {message && (
            <p
              className={`text-sm ${
                message.kind === "error" ? "text-red-600" : "text-gray-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-black px-6 py-4 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Creating account…" : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}
