"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const origin = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Check your email for a reset link.");
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Reset password</h1>
      <p className="text-ink/60 text-sm mb-8">
        We will email you a link to choose a new password.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border border-stone rounded-lg px-4 py-2.5"
        />
        {status && <p className="text-sm text-ink/70">{status}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-royal text-paper py-3 rounded-full disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="text-sm mt-6">
        <Link href="/sign-in" className="text-royal">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
