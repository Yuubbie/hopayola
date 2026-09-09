"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/account");
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

            <div>
              <label className="block text-sm mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-stone rounded-lg px-4 py-2.5 focus:border-royal outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-royal text-paper py-3 rounded-full hover:bg-royal-deep transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-ink/60 mt-6">
            Don't have an account?{" "}
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