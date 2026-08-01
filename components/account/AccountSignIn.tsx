"use client";

import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/checkout/AuthPanel";

export function AccountSignIn() {
  const router = useRouter();

  return (
    <div className="px-4 py-14 sm:px-6">
      <AuthPanel
        eyebrow="Account"
        signInHint="Sign in to view your orders and saved details."
        onAuthenticated={async () => {
          router.refresh();
        }}
      />
    </div>
  );
}
