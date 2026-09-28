"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const STEPS = [
  {
    kicker: "How Hopayola works",
    title: "One place to plan the outfit",
    body: "You bring the idea and fabric. Hopayola matches you with artisans and keeps every stage visible — from consult to delivery.",
  },
  {
    kicker: "If you are a client",
    title: "Start a project, then pay once",
    body: "Submit the brief, get a team, pay the project total (plus 5% service). Artisans are paid after you confirm each milestone.",
  },
  {
    kicker: "If you sew or design",
    title: "Join as artisan, claim work, get paid",
    body: "Create a profile, add your bank for payouts, claim jobs in your city, submit proof when a stage is done.",
  },
  {
    kicker: "Money",
    title: "You confirm. Then we pay the artisan.",
    body: "Hopayola is the merchant of record. Client payment is received by the company. The artisan is paid as a subcontractor after you accept the work.",
  },
];

export default function DemoOnboarding({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);

  const close = useCallback(() => {
    setStep(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/70 px-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-title"
    >
      <div
        className="relative w-full max-w-lg bg-paper rounded-3xl p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close demo"
          className="absolute top-4 right-4 text-ink/40 hover:text-ink text-2xl leading-none"
        >
          &times;
        </button>

        <p className="text-royal text-xs tracking-widest uppercase mb-2">
          {current.kicker}
        </p>
        <h2 id="demo-title" className="font-display text-3xl mb-4">
          {current.title}
        </h2>
        <p className="text-ink/70 leading-relaxed mb-8">{current.body}</p>

        <div className="flex gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-royal" : "bg-stone"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm text-ink/50 hover:text-ink disabled:opacity-30"
          >
            Back
          </button>

          {last ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/artisan/sign-up"
                onClick={close}
                className="border border-ink/15 px-4 py-2.5 rounded-full text-sm hover:border-royal"
              >
                Join as artisan
              </Link>
              <Link
                href="/projects/new"
                onClick={close}
                className="bg-royal text-paper px-4 py-2.5 rounded-full text-sm hover:bg-royal-deep"
              >
                Start a project
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="bg-royal text-paper px-5 py-2.5 rounded-full text-sm hover:bg-royal-deep"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
