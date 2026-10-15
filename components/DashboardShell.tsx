"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/account", label: "Dashboard", exact: true },
  { href: "/account#projects", label: "My projects" },
  { href: "/projects/new", label: "New project" },
  { href: "/lifestyle", label: "Wardrobe" },
  { href: "/account/messages", label: "Messages" },
  { href: "/account/measurements", label: "Measurements" },
  { href: "/account/saved", label: "Saved items" },
  { href: "https://shop.hopayola.com", label: "Shop", external: true },
  { href: "/account/settings", label: "Settings" },
];

export default function DashboardShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const initial = (userName || "H").trim().charAt(0).toUpperCase();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (href.startsWith("http")) return false;
    const clean = href.split("#")[0];
    if (exact) return pathname === clean;
    if (clean === "/account") return false;
    return pathname?.startsWith(clean);
  }

  const nav = (
    <nav className="space-y-1">
      {LINKS.map((link) =>
        link.external ? (
          <a
            key={link.href}
            href={link.href}
            className="block rounded-xl px-4 py-2.5 text-sm text-paper/70 hover:bg-paper/10 hover:text-paper transition-colors"
          >
            {link.label}
          </a>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`block rounded-xl px-4 py-2.5 text-sm transition-colors ${
              isActive(link.href, link.exact)
                ? "bg-paper/15 text-paper font-medium"
                : "text-paper/70 hover:bg-paper/10 hover:text-paper"
            }`}
          >
            {link.label}
          </Link>
        )
      )}
    </nav>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr] bg-paper">
      <aside className="hidden md:flex md:flex-col bg-royal text-paper p-6 sticky top-0 h-screen overflow-y-auto">
        <Link href="/" className="block mb-10">
          <Image
            src="/images/logo-wordmark.png"
            alt="Hopayola"
            width={140}
            height={40}
            className="h-9 w-auto brightness-0 invert"
          />
        </Link>
        {nav}
        <div className="mt-auto pt-8">
          <div className="rounded-2xl overflow-hidden border border-paper/15">
            <Image
              src="/images/marquee-4.jpg"
              alt=""
              width={400}
              height={220}
              className="w-full h-28 object-cover"
            />
            <div className="p-4 bg-paper/10">
              <p className="font-display text-sm mb-1">Premium concepts</p>
              <p className="text-[11px] text-paper/70 leading-relaxed mb-3">
                Seven drawn looks instead of three, for bigger occasions.
              </p>
              <Link
                href="/projects/new?tier=premium"
                className="block text-center text-xs bg-paper text-royal rounded-full px-3 py-2 font-medium"
              >
                Choose Premium
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 w-full text-left rounded-xl px-4 py-2.5 text-sm text-paper/70 hover:bg-paper/10 hover:text-paper transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-stone">
          <div className="px-5 md:px-10 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="md:hidden p-2 -ml-2"
                aria-label="Open menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </button>
              <p className="text-sm text-ink/50 truncate hidden sm:block">
                Your Hopayola workspace
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/projects/new"
                className="hidden sm:inline-block bg-royal text-paper text-sm px-4 py-2 rounded-full hover:bg-royal-deep transition-colors"
              >
                Start a project
              </Link>
              <Link
                href="/account/messages"
                aria-label="Messages"
                className="p-2 text-ink/50 hover:text-royal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-4.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z" />
                </svg>
              </Link>
              <span className="flex items-center gap-2">
                <span className="h-9 w-9 rounded-full bg-royal text-paper flex items-center justify-center text-sm font-medium">
                  {initial}
                </span>
                <span className="hidden lg:block text-sm">
                  <span className="block leading-tight">{userName || "Client"}</span>
                  <span className="block text-[11px] text-ink/40">Client</span>
                </span>
              </span>
            </div>
          </div>
        </header>

        {open && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="w-64 bg-royal text-paper p-6 overflow-y-auto">
              <Link href="/" className="block mb-8">
                <Image
                  src="/images/logo-wordmark.png"
                  alt="Hopayola"
                  width={140}
                  height={40}
                  className="h-9 w-auto brightness-0 invert"
                />
              </Link>
              {nav}
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-6 w-full text-left rounded-xl px-4 py-2.5 text-sm text-paper/70"
              >
                Sign out
              </button>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex-1 bg-ink/40"
            />
          </div>
        )}

        <div className="px-5 md:px-10 py-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
