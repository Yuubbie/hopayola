"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Mark } from "@/components/Logo";
import type { ChatTurn, Session } from "@/lib/types";
import { sanitizeWebsite } from "@/lib/website";
import { loadExtraListings } from "@/lib/listings-store";

export default function DemoPage() {
  const [input, setInput] = useState("");
  const [website, setWebsite] = useState("");
  const [agency, setAgency] = useState("");
  const [copied, setCopied] = useState(false);
  const [session, setSession] = useState<Session>({});
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      role: "bot",
      text: "Hello — this is PlotReply. Rent, buy, or short-let? Send city and budget.",
    },
  ]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const site = sanitizeWebsite(q.get("site") || localStorage.getItem("pr_site") || "");
    const name = q.get("name") || localStorage.getItem("pr_name") || "";
    if (site) setWebsite(site);
    if (name) setAgency(name);
    setSession((s) => ({ ...s, websiteUrl: site, agencyName: name || undefined }));
  }, []);

  function persistSite(next: string, name: string) {
    const clean = sanitizeWebsite(next);
    setWebsite(clean || next);
    setAgency(name);
    if (clean) localStorage.setItem("pr_site", clean);
    else localStorage.removeItem("pr_site");
    if (name) localStorage.setItem("pr_name", name);
    setSession((s) => ({ ...s, websiteUrl: clean, agencyName: name || undefined }));
  }

  function shareUrl() {
    if (typeof window === "undefined") return "/demo";
    const u = new URL(window.location.origin + "/demo");
    const clean = sanitizeWebsite(website);
    if (clean) u.searchParams.set("site", clean);
    if (agency.trim()) u.searchParams.set("name", agency.trim());
    return u.toString();
  }

  async function copyShare() {
    await navigator.clipboard.writeText(shareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;
    setInput("");
    setTurns((t) => [...t, { role: "user", text }]);
    setPending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          listings: loadExtraListings(),
          session: {
            ...session,
            websiteUrl: sanitizeWebsite(website),
            agencyName: agency.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      setSession(data.session);
      setTurns((t) => [...t, { role: "bot", text: data.text }]);
    } catch {
      setTurns((t) => [
        ...t,
        { role: "bot", text: "Inbox is offline. Try again in a moment." },
      ]);
    }
    setPending(false);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-5xl gap-10 px-5 py-10 md:grid-cols-[1fr_20rem]">
        <div className="overflow-hidden rounded-[28px] border border-ink/10 bg-ink shadow-xl">
          <div className="flex items-center gap-3 px-4 py-3 text-sand">
            <Mark className="h-9 w-9" />
            <div>
              <p className="text-sm font-medium">{agency || "PlotReply demo"}</p>
              <p className="text-[11px] text-sand/50">
                {sanitizeWebsite(website) ? "Catalogue linked" : "Seed listings · Lagos · Abuja · PH"}
              </p>
            </div>
          </div>
          <div className="flex min-h-[420px] flex-col bg-[#ece5dd]">
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {turns.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug shadow-sm ${
                    m.role === "user"
                      ? "ml-auto rounded-tr-sm bg-[#d9fdd3]"
                      : "rounded-tl-sm bg-white"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex gap-2 bg-[#f0f2f5] p-3">
              <input
                className="flex-1 rounded-full border-0 px-4 py-2.5 text-sm outline-none"
                placeholder="2-bed Lekki rent 4m"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                className="rounded-full bg-moss px-4 text-sm text-white disabled:opacity-50"
                disabled={pending}
              >
                Send
              </button>
            </form>
          </div>
        </div>
        <aside className="text-sm text-ink/70">
          <h1 className="font-serif text-2xl text-ink">CEO demo pack</h1>
          <p className="mt-2">
            Paste their public listings URL. Clients browse that site, then tell PlotReply what they
            want — or paste the listing link here.
          </p>
          <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-ink/45">
            Agency name
            <input
              className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm font-normal text-ink"
              placeholder="e.g. Horizon Homes"
              value={agency}
              onChange={(e) => persistSite(website, e.target.value)}
            />
          </label>
          <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-ink/45">
            Their website
            <input
              className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm font-normal text-ink"
              placeholder="https://their-agency.com"
              value={website}
              onChange={(e) => persistSite(e.target.value, agency)}
            />
          </label>
          <button
            type="button"
            onClick={copyShare}
            className="mt-4 w-full rounded-full bg-ink py-2.5 text-sm text-sand"
          >
            {copied ? "Link copied" : "Copy shareable demo link"}
          </button>
          <p className="mt-3 break-all text-[11px] text-ink/40">{shareUrl()}</p>
          <ul className="mt-6 list-disc space-y-2 pl-4">
            <li>2 bedroom Lekki rent 4m</li>
            <li>short-let VI 2 nights</li>
            <li>website</li>
            <li>send money to hold it</li>
          </ul>
        </aside>
      </main>
    </>
  );
}
