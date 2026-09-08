"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const links = [
  { href: "/about", label: "About" },
  { href: "/fashion", label: "Fashion" },
  { href: "/lifestyle", label: "Lifestyle" },
  { href: "https://shop.hopayola.com", label: "Shop" },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b border-stone">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-tight">
          Hopayola
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink/80 hover:text-royal transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link
                href="/account"
                className="text-ink/80 hover:text-royal transition-colors hidden sm:inline"
              >
                Account
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-royal text-paper px-4 py-2 rounded-full hover:bg-royal-deep transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-ink/80 hover:text-royal transition-colors hidden sm:inline"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="bg-royal text-paper px-4 py-2 rounded-full hover:bg-royal-deep transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}