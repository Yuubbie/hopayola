"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SESSION_KEY = "hopayola_welcome_seen";

export default function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(SESSION_KEY);
      if (!seen) {
        const t = setTimeout(() => setOpen(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      // sessionStorage unavailable - just skip the popup
    }
  }, []);

  function close() {
    setOpen(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md bg-paper rounded-3xl p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 text-ink/40 hover:text-ink text-xl leading-none"
        >
          &times;
        </button>

        <p className="text-royal text-sm mb-1">Welcome to Hopayola</p>
        <h2 className="font-display text-2xl mb-6">
          How would you like to get started?
        </h2>

        <div className="space-y-3">
          <Link
            href="/projects/new"
            onClick={close}
            className="flex items-center justify-between border border-stone rounded-2xl p-4 hover:border-royal transition-colors group"
          >
            <span>
              <span className="block text-sm font-medium">
                I'm a client
              </span>
              <span className="block text-ink/50 text-sm">
                Start a project and get matched with a team
              </span>
            </span>
            <span className="text-ink/30 group-hover:text-royal transition-colors">
              &rarr;
            </span>
          </Link>

          <Link
            href="/artisan/sign-up"
            onClick={close}
            className="flex items-center justify-between border border-stone rounded-2xl p-4 hover:border-royal transition-colors group"
          >
            <span>
              <span className="block text-sm font-medium">
                I'm a tailor or artisan
              </span>
              <span className="block text-ink/50 text-sm">
                Join and start claiming projects
              </span>
            </span>
            <span className="text-ink/30 group-hover:text-royal transition-colors">
              &rarr;
            </span>
          </Link>
        </div>

        <button
          onClick={close}
          className="w-full text-center text-ink/40 text-sm mt-6 hover:text-ink transition-colors"
        >
          Continue browsing
        </button>
      </div>
    </div>
  );
}