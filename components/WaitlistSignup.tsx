"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notifyWaitlistSignup } from "@/app/actions/notifications";

const INTEREST_OPTIONS = [
  "Client",
  "Fashion Artisan / Tailor",
  "Independent Designer",
  "Media / Partnership",
];

export default function WaitlistSignup() {
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState(INTEREST_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("waitlist_signups")
      .insert({ email, interest });

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        setError("This email is already on the waitlist.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      return;
    }

    setSubmitted(true);
    notifyWaitlistSignup(email, interest);
  }

  return (
    <section className="bg-ink text-paper py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        {submitted ? (
          <>
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              You're on the list.
            </h2>
            <p className="text-paper/70 leading-relaxed">
              We'll be in touch as Hopayola grows. Thank you for your interest.
            </p>
          </>
        ) : (
          <>
            <p className="text-royal text-sm mb-4">Early access</p>
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              Join the waitlist.
            </h2>
            <p className="text-paper/70 leading-relaxed mb-8">
              Be the first to know as Hopayola grows beyond our Abuja pilot.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-full px-5 py-3 text-ink outline-none"
              />
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="rounded-full px-4 py-3 text-ink outline-none"
              >
                {INTEREST_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="bg-royal text-paper px-6 py-3 rounded-full hover:bg-royal-deep transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {loading ? "Joining..." : "Join waitlist"}
              </button>
            </form>

            {error && (
              <p className="text-sm text-red-300 mt-4">{error}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}