"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function OnboardPage() {
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const site = String(fd.get("website") || "");
    const name = String(fd.get("agency") || "");
    if (site) localStorage.setItem("pr_site", site);
    if (name) localStorage.setItem("pr_name", name);
    setDone(true);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-12">
        {done ? (
          <div className="rounded-2xl border border-moss/20 bg-cream p-8">
            <h1 className="font-serif text-2xl">Listing captured</h1>
            <p className="mt-3 text-sm text-ink/65">
              Wizard is live. Persistence comes with Supabase. The demo bot already answers on
              Lagos / Abuja / PH stock.
            </p>
            <Link
              href="/demo"
              className="mt-6 inline-block rounded-full bg-moss px-5 py-2.5 text-sm text-white"
            >
              Test the inbox
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl">Go live</h1>
            <p className="mt-2 text-sm text-ink/55">Self-serve. You add the house. English nationwide.</p>
            <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-ink/8 bg-cream p-6">
              {[
                ["agency", "Agency name", "text", "Horizon Homes"],
                ["website", "Listings website (for clients)", "url", "https://"],
                ["title", "Title", "text", "2-bed in a gated estate"],
                ["city", "City", "text", "Lagos"],
                ["area", "Area / estate", "text", "Lekki Phase 1"],
              ].map(([name, label, type, ph]) => (
                <label key={name} className="block text-sm font-medium">
                  {label}
                  <input
                    required
                    name={name}
                    type={type}
                    placeholder={ph}
                    className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-normal"
                  />
                </label>
              ))}
              <label className="block text-sm font-medium">
                Type
                <select name="intent" className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-normal">
                  <option value="rent">Rent (yearly)</option>
                  <option value="shortlet">Short-let</option>
                  <option value="sale">Sale</option>
                </select>
              </label>
              <label className="block text-sm font-medium">
                Price (₦)
                <input
                  required
                  type="number"
                  name="price"
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-normal"
                />
              </label>
              <button className="w-full rounded-full bg-moss py-3 text-sm text-white">Save listing</button>
            </form>
          </>
        )}
      </main>
    </>
  );
}
