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
    kicker: "Client · 1 of 9",
    title: "Create a client account",
    body: "hopayola.com/sign-up — not the artisan form.",
    scene: "clientsignup",
  },
  {
    kicker: "Client · 2 of 9",
    title: "Lifestyle first",
    body: "Free measurement guide. Shop pieces can be added to your wardrobe later.",
    scene: "resources",
  },
  {
    kicker: "Client · 3 of 9",
    title: "Start a project",
    body: "Occasion and garment required. Optional photos, budget, deadline.",
    scene: "project",
  },
  {
    kicker: "Client · 4 of 9",
    title: "Pick a look",
    body: "Standard: 3 concepts. Premium: 7. Choose one before making starts.",
    scene: "concepts",
  },
  {
    kicker: "Client · 5 of 9",
    title: "An artisan claims you",
    body: "They claim from Fashion or their account. Their name appears on your card.",
    scene: "assigned",
  },
  {
    kicker: "Client · 6 of 9",
    title: "Send fabric",
    body: "GIG or Bolt. Work and payment wait until the artisan marks fabric received.",
    scene: "fabric",
  },
  {
    kicker: "Client · 7 of 9",
    title: "Pay once",
    body: "After fabric is in: one Paystack payment (your budget + 5%). Hopayola holds it.",
    scene: "pay",
  },
  {
    kicker: "Client · 8 of 9",
    title: "Review the work",
    body: "Milestones 1–3 are reviews only — approve or request changes. Not three payments.",
    scene: "confirm",
  },
  {
    kicker: "Client · 9 of 9",
    title: "Mark it received",
    body: "Artisan ships (GIG/Bolt). You tap received. Then the artisan is paid. You get points; the piece is in your wardrobe.",
    scene: "done",
  },
];

const ARTISAN: Frame[] = [
  {
    kicker: "Artisan · 1 of 7",
    title: "Join as artisan",
    body: "hopayola.com/artisan/sign-up — specialty, region, skills.",
    scene: "signup",
  },
  {
    kicker: "Artisan · 2 of 7",
    title: "Save payout details",
    body: "Bank, 10-digit account, verify name. Paid only when the client marks received.",
    scene: "bank",
  },
  {
    kicker: "Artisan · 3 of 7",
    title: "Claim a project",
    body: "Fashion list or your account. Open jobs in your city.",
    scene: "claim",
  },
  {
    kicker: "Artisan · 4 of 7",
    title: "Confirm fabric",
    body: "Client sends via GIG or Bolt. You confirm it arrived. Then they can pay.",
    scene: "confirmfabric",
  },
  {
    kicker: "Artisan · 5 of 7",
    title: "Ask for review",
    body: "Submit milestone 1, 2, then 3 with optional proof. Client approves or asks for changes.",
    scene: "submit",
  },
  {
    kicker: "Artisan · 6 of 7",
    title: "Ship the outfit",
    body: "When the last review is approved, send with GIG or Bolt.",
    scene: "ship",
  },
  {
    kicker: "Artisan · 7 of 7",
    title: "Get paid once",
    body: "When the client marks the outfit received, Hopayola pays you (budget minus 5%) to your bank.",
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
        {id === "concepts" && (
          <>
            <p className="text-royal text-xs mb-2">Your looks</p>
            <Row k="Concept 1" v="Standard" />
            <Row k="Concept 2" v="Standard" />
            <Row k="Concept 3" v="Standard" />
            <FakeBtn>Choose this look</FakeBtn>
          </>
        )}
        {id === "assigned" && (
          <>
            <p className="text-royal text-xs mb-2">Your project</p>
            <p className="font-medium text-sm mb-1">Three Piece Suit</p>
            <p className="text-royal-deep text-sm">Claimed by Yubbiee Uby</p>
            <p className="text-ink/50 text-xs mt-2">Fashion · Claim</p>
          </>
        )}
        {id === "fabric" && (
          <>
            <p className="text-royal text-xs mb-2">Send fabric</p>
            <p className="text-sm text-ink/70 mb-3">
              Book GIG or Bolt. Then mark sent. Payment waits until fabric is received.
            </p>
            <FakeBtn>I sent fabric · Bolt</FakeBtn>
          </>
        )}
        {id === "pay" && (
          <>
            <p className="text-royal text-xs mb-2">One payment</p>
            <Row k="Project" v="NGN 20,000" />
            <Row k="Service 5%" v="NGN 1,000" />
            <Row k="Held by Hopayola" v="NGN 21,000" />
            <FakeBtn>Pay with Paystack</FakeBtn>
          </>
        )}
        {id === "confirm" && (
          <>
            <p className="text-royal text-xs mb-2">Milestone 2 of 3 · review</p>
            <p className="text-sm font-medium">Approve or request changes</p>
            <p className="text-ink/50 text-xs mt-1">Not a payment — money stays held.</p>
            <div className="flex gap-2 mt-3">
              <span className="bg-royal text-paper text-xs rounded-full px-3 py-1.5">
                Approve
              </span>
              <span className="text-xs border border-stone rounded-full px-3 py-1.5">
                Request changes
              </span>
            </div>
          </>
        )}
        {id === "done" && (
          <>
            <p className="text-royal text-xs mb-2">Outfit arrived</p>
            <p className="font-medium text-sm">Three Piece Suit</p>
            <p className="text-sm text-ink/60 mt-1">+50 points · In wardrobe</p>
            <FakeBtn>I received the outfit</FakeBtn>
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
            <p className="text-royal text-xs mb-2">Fashion · open jobs</p>
            <p className="font-medium text-sm">Three Piece Suit — Corporate</p>
            <p className="text-ink/50 text-xs mt-1">Abuja · Standard</p>
            <FakeBtn>Claim</FakeBtn>
          </>
        )}
        {id === "confirmfabric" && (
          <>
            <p className="text-royal text-xs mb-2">Fabric</p>
            <p className="text-sm">Client sent via Bolt</p>
            <FakeBtn>Fabric received</FakeBtn>
          </>
        )}
        {id === "submit" && (
          <>
            <p className="text-royal text-xs mb-2">Your claimed project</p>
            <p className="text-sm font-medium">Milestone 1 — ready for review</p>
            <p className="text-ink/50 text-xs mt-1">Proof URL (optional)</p>
            <FakeBtn>Ask client to review</FakeBtn>
          </>
        )}
        {id === "ship" && (
          <>
            <p className="text-royal text-xs mb-2">Ship outfit</p>
            <p className="text-sm text-ink/70">GIG or Bolt, then mark shipped.</p>
            <FakeBtn>I shipped · GIG</FakeBtn>
          </>
        )}
        {id === "paid" && (
          <>
            <p className="text-sm font-medium">Client marked received</p>
            <Row k="Held payment" v="NGN 20,000" />
            <Row k="You receive (95%)" v="NGN 19,000" />
            <p className="text-green-700 text-xs mt-3">One payout · Ecobank</p>
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
                  Project, fabric, one payment, reviews, received.
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
                  Claim, confirm fabric, reviews, ship, paid on received.
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
