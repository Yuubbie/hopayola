"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/password-input";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resendNote, setResendNote] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const code = hash.get("error_code") || q.get("error_code");
    const desc = hash.get("error_description") || q.get("error_description");
    if (code === "otp_expired" || (desc && desc.includes("expired"))) {
      setError(
        "This reset link is invalid or has expired. Request a new one — open it once, soon after it arrives."
      );
      return;
    }
    if (q.get("error") === "confirmation_failed") {
      setError(
        "That email link didn’t complete. Request a new reset and open the latest mail."
      );
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendNote(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      setUnconfirmed(/confirm/i.test(error.message));
      return;
    }

    router.push("/account");
  }

  async function resendConfirmation() {
    setResendNote(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setResendNote(
      error
        ? error.message
        : "Confirmation email sent. Open the newest one, and check spam."
    );
  }

  return (
    <main className="min-h-[80vh] grid md:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl mb-2">Welcome back</h1>
          <p className="text-ink/60 mb-8">Sign in to your Hopayola account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-stone rounded-lg px-4 py-2.5 focus:border-royal outline-none"
              />
            </div>

            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              required
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            {unconfirmed && (
              <div className="text-sm">
                <button
                  type="button"
                  onClick={resendConfirmation}
                  className="text-royal underline underline-offset-2"
                >
                  Resend confirmation email
                </button>
                {resendNote && <p className="text-ink/60 mt-2">{resendNote}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-royal text-paper py-3 rounded-full hover:bg-royal-deep transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            <Link
              href="/forgot-password"
              className="text-royal hover:text-royal-deep underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </p>

          <p className="text-sm text-ink/60 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-royal hover:text-royal-deep">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden md:block relative">
        <Image
          src="/images/marquee-6.jpg"
          alt="Hopayola fashion"
          fill
          className="object-cover"
          priority
        />
      </div>
    </main>
  );
}
