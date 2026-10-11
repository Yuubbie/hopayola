"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { saveListing } from "@/lib/listings-store";
import { sanitizeWebsite } from "@/lib/website";
import type { Intent } from "@/lib/types";

export default function OnboardPage() {
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const site = sanitizeWebsite(String(fd.get("website") || ""));
    const name = String(fd.get("agency") || "").trim();
    if (site) localStorage.setItem("pr_site", site);
    if (name) localStorage.setItem("pr_name", name);
    saveListing({
      id: `live-${Date.now()}`,
      title: String(fd.get("title") || "").trim(),
      city: String(fd.get("city") || "").trim(),
      area: String(fd.get("area") || "").trim(),
      intent: String(fd.get("intent") || "rent") as Intent,
      beds: Number(fd.get("beds") || 1),
      priceNgn: Number(fd.get("price") || 0),
      notes: "Added by the agent. Inspect first — do not pay this chat.",
    });
    setDone(true);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-12">
        {done ? (
          <div className="rounded-2xl border border-moss/20 bg-cream p-8">
            <h1 className="font-serif text-2xl">Listing is live on this device</h1>
            <p className="mt-3 text-sm text-ink/65">
              Dashboard and the demo inbox will match it. Cloud sync comes with Supabase.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/demo" className="rounded-full bg-moss px-5 py-2.5 text-sm text-white">
                Test the inbox
              </Link>
              <Link href="/dashboard" className="rounded-full border border-ink/15 px-5 py-2.5 text-sm">
                View listings
              </Link>
            </div>
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
                <select
                  name="intent"
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-normal"
                >
                  <option value="rent">Rent (yearly)</option>
                  <option value="shortlet">Short-let</option>
                  <option value="sale">Sale</option>
                </select>
              </label>
              <label className="block text-sm font-medium">
                Beds
                <input
                  required
                  type="number"
                  min={1}
                  name="beds"
                  defaultValue={2}
                  className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-normal"
                />
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
