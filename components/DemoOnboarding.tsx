"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

type Role = "client" | "artisan";

type Frame = {
  kicker: string;
  title: string;
  body: string;
  scene: string;
};

const CLIENT: Frame[] = [
  {
    kicker: "Client · 1 of 8",
    title: "Create a client account",
    body: "hopayola.com/sign-up — name, email, password. Not the artisan form.",
    scene: "clientsignup",
  },
  {
    kicker: "Client · 2 of 8",
    title: "Free measurement guide",
    body: "Download it on Lifestyle. Croquis sheets and Little Artisans are paid in the shop.",
    scene: "resources",
  },
  {
    kicker: "Client · 3 of 8",
    title: "Start a project",
    body: "Occasion and garment are required. Photos are optional if you do not have a picture yet.",
    scene: "project",
  },
  {
    kicker: "Client · 4 of 8",
    title: "Share fit if you have it",
    body: "Measurements help. Skip fabric photos and describe the idea in notes if needed.",
    scene: "fit",
  },
  {
    kicker: "Client · 5 of 8",
    title: "See your artisan",
    body: "Admin assigns a vetted tailor. Their name sits on your project card.",
    scene: "assigned",
  },
  {
    kicker: "Client · 6 of 8",
    title: "Pay the project",
    body: "One checkout: milestone total + 5%. Hopayola is merchant of record.",
    scene: "pay",
  },
  {
    kicker: "Client · 7 of 8",
    title: "Confirm each stage",
    body: "Artisan submits cutting or fitting. You tap Confirm. Then Hopayola can pay that stage.",
    scene: "confirm",
  },
  {
    kicker: "Client · 8 of 8",
    title: "Collect the outfit",
    body: "Delivery is the last stage. Your account shows paid vs pending.",
    scene: "done",
  },
];

const ARTISAN: Frame[] = [
  {
    kicker: "Artisan · 1 of 6",
    title: "Join as artisan",
    body: "Email, specialty, region, skills. Same sign-up that is live on hopayola.com/artisan/sign-up.",
    scene: "signup",
  },
  {
    kicker: "Artisan · 2 of 6",
    title: "Save payout details",
    body: "Bank, 10-digit account, verify name, save. That is the account Hopayola pays.",
    scene: "bank",
  },
  {
    kicker: "Artisan · 3 of 6",
    title: "Claim a project",
    body: "Open jobs in your city. Claim the ones you can deliver.",
    scene: "claim",
  },
  {
    kicker: "Artisan · 4 of 6",
    title: "Submit a milestone",
    body: "When cutting or fitting is done, send proof from your dashboard.",
    scene: "submit",
  },
  {
    kicker: "Artisan · 5 of 6",
    title: "Wait for confirm",
    body: "The client reviews. Status becomes confirmed · payout pending.",
    scene: "pending",
  },
  {
    kicker: "Artisan · 6 of 6",
    title: "Get paid for the stage",
    body: "After confirm, Hopayola sends the artisan payout (minus 5%) to the saved bank.",
    scene: "paid",
  },
];

const INTERVAL_MS = 6000;

function Scene({ id }: { id: string }) {
  return (
    <div className="h-full w-full bg-[#f6f1ea] p-5 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-paper rounded-2xl border border-stone shadow-sm p-5 text-left">
        {id === "clientsignup" && (
          <>
            <p className="text-royal text-xs mb-2">Client sign up</p>
            <Row k="Name" v="Unwana Ubong" />
            <Row k="Email" v="you@email.com" />
            <p className="text-ink/50 text-xs mt-2">Terms &amp; Conditions</p>
            <FakeBtn>Sign up as a client</FakeBtn>
          </>
        )}
        {id === "resources" && (
          <>
            <p className="text-royal text-xs mb-2">Lifestyle · Resources</p>
            <Row k="Measurement guide" v="Free PDF" />
            <Row k="Croquis sketch sheets" v="Shop" />
            <Row k="Little Artisans" v="Shop" />
            <FakeBtn>Download free guide</FakeBtn>
          </>
        )}
        {id === "project" && (
          <>
            <p className="text-royal text-xs mb-2">New project</p>
            <div className="space-y-2 text-sm">
              <Row k="Occasion" v="Corporate / Work" />
              <Row k="Garment" v="Three piece suit" />
              <Row k="Budget" v="NGN 50,000 – 80,000" />
              <Row k="Due" v="20 Oct 2026" />
            </div>
            <p className="text-ink/45 text-xs mt-2">Fabric photos (optional)</p>
            <FakeBtn>Submit project</FakeBtn>
          </>
        )}
        {id === "fit" && (
          <>
            <p className="text-royal text-xs mb-2">Fit profile</p>
            <div className="space-y-2 text-sm">
              <Row k="Chest" v="38 in" />
              <Row k="Waist" v="32 in" />
              <Row k="Fabric" v="Navy wool — 4 yards" />
            </div>
            <FakeBtn>Save measurements</FakeBtn>
          </>
        )}
        {id === "assigned" && (
          <>
            <p className="text-royal text-xs mb-2">Your project</p>
            <p className="font-medium text-sm mb-1">Three Piece Suit</p>
            <p className="text-royal-deep text-sm">Assigned to Yubbiee Uby</p>
            <p className="text-ink/50 text-xs mt-2">Standard package · In production</p>
          </>
        )}
        {id === "pay" && (
          <>
            <p className="text-royal text-xs mb-2">Checkout</p>
            <Row k="Milestones" v="NGN 20,000" />
            <Row k="Service 5%" v="NGN 1,000" />
            <Row k="Total" v="NGN 21,000" />
            <FakeBtn>Pay with Paystack</FakeBtn>
          </>
        )}
        {id === "confirm" && (
          <>
            <p className="text-green-700 text-xs mb-2">Payment received</p>
            <p className="text-sm font-medium">Cutting — completed</p>
            <div className="flex gap-2 mt-3">
              <span className="bg-royal text-paper text-xs rounded-full px-3 py-1.5">
                Confirm & pay artisan
              </span>
              <span className="text-xs text-red-700 py-1.5">Dispute</span>
            </div>
          </>
        )}
        {id === "done" && (
          <>
            <p className="text-royal text-xs mb-2">Project</p>
            <p className="font-medium text-sm">Three Piece Suit</p>
            <p className="text-sm text-ink/60 mt-1">Delivery — paid</p>
            <p className="text-green-700 text-xs mt-3">Ready for pickup</p>
          </>
        )}
        {id === "signup" && (
          <>
            <p className="text-royal text-xs mb-2">Artisan sign up</p>
            <Row k="Name" v="Yubbiee Uby" />
            <Row k="Specialty" v="Tailoring" />
            <Row k="Region" v="Abuja" />
            <FakeBtn>Create artisan account</FakeBtn>
          </>
        )}
        {id === "bank" && (
          <>
            <p className="text-royal text-xs mb-2">Payout details</p>
            <Row k="Bank" v="Ecobank Nigeria" />
            <Row k="Account" v="1234567890" />
            <Row k="Name" v="Verified · Yubbiee Uby" />
            <FakeBtn>Save payout details</FakeBtn>
          </>
        )}
        {id === "claim" && (
          <>
            <p className="text-royal text-xs mb-2">Open near you</p>
            <p className="font-medium text-sm">Three Piece Suit — Corporate</p>
            <p className="text-ink/50 text-xs mt-1">Abuja · Standard · Due 20 Oct</p>
            <FakeBtn>Claim this project</FakeBtn>
          </>
        )}
        {id === "submit" && (
          <>
            <p className="text-royal text-xs mb-2">Your claimed project</p>
            <p className="text-sm font-medium">Cutting — in progress</p>
            <p className="text-ink/50 text-xs mt-1">Proof URL (optional)</p>
            <FakeBtn>Mark stage complete</FakeBtn>
          </>
        )}
        {id === "pending" && (
          <>
            <p className="text-sm font-medium">Cutting — completed</p>
            <p className="text-ink/50 text-xs mt-2">Client confirmed · payout pending</p>
          </>
        )}
        {id === "paid" && (
          <>
            <p className="text-sm font-medium">Cutting — paid</p>
            <Row k="Stage amount" v="NGN 10,000" />
            <Row k="You receive (95%)" v="NGN 9,500" />
            <p className="text-green-700 text-xs mt-3">Sent to Ecobank · 1234567890</p>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm py-1 border-b border-stone/80">
      <span className="text-ink/45">{k}</span>
      <span className="text-ink text-right">{v}</span>
    </div>
  );
}

function FakeBtn({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 bg-royal text-paper text-sm text-center rounded-full py-2.5">
      {children}
    </div>
  );
}

export default function DemoOnboarding({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [role, setRole] = useState<Role | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const frames = role === "artisan" ? ARTISAN : CLIENT;

  const close = useCallback(() => {
    setRole(null);
    setIndex(0);
    setPlaying(true);
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

  useEffect(() => {
    if (!open || !role || !playing) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, INTERVAL_MS);
    return () => clearInterval(t);
  }, [open, role, playing, frames.length]);

  if (!open) return null;

  const frame = frames[index];
  const last = index === frames.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 px-4 py-6"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-title"
    >
      <div
        className="relative w-full max-w-3xl bg-paper rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close demo"
          className="absolute top-3 right-4 z-10 text-ink/40 hover:text-ink text-3xl leading-none"
        >
          &times;
        </button>

        {!role ? (
          <div className="p-8 md:p-12">
            <p className="text-royal text-xs tracking-widest uppercase mb-2">
              Onboarding demo
            </p>
            <h2 id="demo-title" className="font-display text-3xl md:text-4xl mb-3">
              Watch how Hopayola works
            </h2>
            <p className="text-ink/60 mb-8 max-w-prose">
              Pick a path. Each scene is the real screen for that step — not a random photo.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setRole("client");
                  setIndex(0);
                  setPlaying(true);
                }}
                className="text-left border border-stone rounded-2xl p-6 hover:border-royal transition-colors"
              >
                <span className="block font-display text-xl mb-1">I&apos;m a client</span>
                <span className="text-sm text-ink/55">
                  Sign up, free guide, project, pay, confirm.
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("artisan");
                  setIndex(0);
                  setPlaying(true);
                }}
                className="text-left border border-stone rounded-2xl p-6 hover:border-royal transition-colors"
              >
                <span className="block font-display text-xl mb-1">I&apos;m an artisan</span>
                <span className="text-sm text-ink/55">
                  Sign up, bank, claim, submit, get paid.
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative aspect-[16/10] min-h-[280px]">
              <Scene id={frame.scene} />
            </div>
            <div className="px-5 md:px-8 py-4 border-t border-stone">
              <p className="text-royal text-xs uppercase tracking-widest mb-1">
                {frame.kicker}
              </p>
              <h2 id="demo-title" className="font-display text-2xl mb-1">
                {frame.title}
              </h2>
              <p className="text-ink/65 text-sm mb-4">{frame.body}</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 flex-1 min-w-[120px]">
                  {frames.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Scene ${i + 1}`}
                      onClick={() => setIndex(i)}
                      className={`h-1.5 flex-1 rounded-full ${
                        i === index ? "bg-royal" : "bg-stone"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="text-xs text-ink/60 hover:text-ink"
                >
                  {playing ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="text-xs text-ink/60 hover:text-ink"
                >
                  Switch path
                </button>
                {last && (
                  <Link
                    href={role === "artisan" ? "/artisan/sign-up" : "/projects/new"}
                    onClick={close}
                    className="ml-auto bg-royal text-paper text-sm px-4 py-2 rounded-full hover:bg-royal-deep"
                  >
                    {role === "artisan" ? "Join as artisan" : "Start a project"}
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
