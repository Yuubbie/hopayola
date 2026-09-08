"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ComingSoon({
  title,
  description,
  interest,
}: {
  title: string;
  description: string;
  interest: "hire_talent" | "create_team" | "design_outfit";
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("waitlist_signups").insert({ email, interest });
    setSubmitted(true);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-32 text-center">
      <p className="text-royal text-sm mb-4">Coming soon</p>
      <h1 className="font-display text-4xl mb-4">{title}</h1>
      <p className="text-ink/70 leading-relaxed mb-10">{description}</p>

      {submitted ? (
        <p className="text-royal">
          You're on the list. We'll let you know when this opens up.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-stone rounded-full px-5 py-3 flex-1 max-w-xs focus:border-royal outline-none"
          />
          <button
            type="submit"
            className="bg-royal text-paper px-6 py-3 rounded-full hover:bg-royal-deep transition-colors"
          >
            Join the waitlist
          </button>
        </form>
      )}
    </main>
  );
}
