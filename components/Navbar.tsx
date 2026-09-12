"use client";

import Link from "next/link";
import Image from "next/image";
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
  const [role, setRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => setRole(profile?.role ?? null));
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data: profile }) => setRole(profile?.role ?? null));
        } else {
          setRole(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const showStartProject = user && role !== "artisan" && role !== "admin";
  const showArtisanLink = role !== "artisan" && role !== "admin";

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b border-stone">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/images/logo.png"
            alt="Hopayola"
            width={28}
            height={28}
            className="h-7 w-auto"
          />
          <span className="font-display text-2xl tracking-tight">
            Hopayola
          </span>
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
          {showArtisanLink && (
            <Link
              href="/artisan/sign-up"
              className="text-ink/80 hover:text-royal transition-colors"
            >
              Artisans
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3 text-sm">
          {user ? (
            <>
              {showStartProject && (
                <Link
                  href="/projects/new"
                  className="text-ink/80 hover:text-royal transition-colors"
                >
                  Start a project
                </Link>
              )}
              <Link
                href="/account"
                className="text-ink/80 hover:text-royal transition-colors"
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
                className="text-ink/80 hover:text-royal transition-colors"
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

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 -mr-2"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-stone bg-paper px-6 py-6 flex flex-col gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-ink/80 hover:text-royal transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {showArtisanLink && (
            <Link
              href="/artisan/sign-up"
              onClick={() => setMenuOpen(false)}
              className="text-ink/80 hover:text-royal transition-colors"
            >
              Artisans
            </Link>
          )}

          <div className="border-t border-stone pt-5 flex flex-col gap-4">
            {user ? (
              <>
                {showStartProject && (
                  <Link
                    href="/projects/new"
                    onClick={() => setMenuOpen(false)}
                    className="text-ink/80 hover:text-royal transition-colors"
                  >
                    Start a project
                  </Link>
                )}
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="text-ink/80 hover:text-royal transition-colors"
                >
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-royal text-paper px-4 py-2.5 rounded-full text-center"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="text-ink/80 hover:text-royal transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMenuOpen(false)}
                  className="bg-royal text-paper px-4 py-2.5 rounded-full text-center"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}