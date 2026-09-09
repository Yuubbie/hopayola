"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSubmitted(true);
  }

  return (
    <main className="min-h-[80vh] grid md:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-sm">
          {submitted ? (
            <div className="text-center">
              <h1 className="font-display text-3xl mb-4">Check your email</h1>
              <p className="text-ink/70 leading-relaxed">
                We sent a confirmation link to <strong>{email}</strong>.
                Click it to finish creating your account.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl mb-2">
                Create your account
              </h1>
              <p className="text-ink/60 mb-8">
                Save your measurements, follow your projects, and pick up
                where you left off.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1" htmlFor="fullName">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-stone rounded-lg px-4 py-2.5 focus:border-royal outline-none"
                  />
                </div>

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
                    minLength={6}
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
                  {loading ? "Creating account..." : "Sign up"}
                </button>
              </form>

              <p className="text-sm text-ink/60 mt-6">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-royal hover:text-royal-deep"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="hidden md:block relative">
        <Image
          src="/images/marquee-2.jpg"
          alt="Hopayola fashion"
          fill
          className="object-cover"
          priority
        />
      </div>
    </main>
  );
}