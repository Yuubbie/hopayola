"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/password-input";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      setStatus("This reset link is invalid or expired. Request a new one.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setStatus(error.message);
      return;
    }
    router.push("/account");
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-display text-3xl mb-2">New password</h1>
      <form onSubmit={onSubmit} className="space-y-4 mt-8">
        <PasswordInput
          id="password"
          value={password}
          onChange={setPassword}
          required
        />
        {status && <p className="text-sm text-red-600">{status}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-royal text-paper py-3 rounded-full disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save password"}
        </button>
      </form>
    </main>
  );
}
