"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Role = "client" | "artisan";

type Frame = {
  image: string;
  alt: string;
  kicker: string;
  title: string;
  body: string;
};

const CLIENT: Frame[] = [
  {
    image: "/images/hero-client.jpg",
    alt: "Finished custom look",
    kicker: "Client · 1 of 6",
    title: "Bring the idea",
    body: "Start a project with the occasion, garment, budget, and deadline. Hopayola coordinates so you are not chasing five people.",
  },
  {
    image: "/images/occasion-wedding.jpg",
    alt: "Occasion styling",
    kicker: "Client · 2 of 6",
    title: "Share fabric and fit",
    body: "Add references and measurements. Design support happens before anyone cuts cloth.",
  },
  {
    image: "/images/create-a-team.jpg",
    alt: "Planning a look",
    kicker: "Client · 3 of 6",
    title: "Get a matched artisan",
    body: "We assign a vetted tailor or team in your city. You see who is on the job from your account.",
  },
  {
    image: "/images/occasion-corporate.jpg",
    alt: "Everyday tailored look",
    kicker: "Client · 4 of 6",
    title: "Pay the project once",
    body: "Checkout is the milestone total plus 5%. Hopayola receives the payment as merchant of record.",
  },
  {
    image: "/images/occasion-naming.jpg",
    alt: "Named occasion look",
    kicker: "Client · 5 of 6",
    title: "Confirm each stage",
    body: "Cutting, fitting, finish — the artisan submits proof. You confirm. Then they can be paid for that stage.",
  },
  {
    image: "/images/occasion-owambe.jpg",
    alt: "Occasion finish",
    kicker: "Client · 6 of 6",
    title: "Wear it",
    body: "Delivery is the last stage. You always know where the work stands.",
  },
];

const ARTISAN: Frame[] = [
  {
    image: "/images/design-my-outfit.jpg",
    alt: "Workshop",
    kicker: "Artisan · 1 of 6",
    title: "Join Hopayola",
    body: "Sign up as artisan, set specialty, skills, region, and availability. Hope reviews new profiles.",
  },
  {
    image: "/images/occasion-cultural.jpg",
    alt: "Craft",
    kicker: "Artisan · 2 of 6",
    title: "Add payout details",
    body: "Verify your Nigerian bank account. That is where milestone payouts go after the client confirms.",
  },
  {
    image: "/images/create-a-team.jpg",
    alt: "Matching",
    kicker: "Artisan · 3 of 6",
    title: "Claim work near you",
    body: "Open projects in your region show on your dashboard. Claim a job you can deliver.",
  },
  {
    image: "/images/occasion-everyday.jpg",
    alt: "Making",
    kicker: "Artisan · 4 of 6",
    title: "Work the milestones",
    body: "Each job is split (cutting, fitting, finish). Submit a proof link when a stage is done.",
  },
  {
    image: "/images/occasion-wedding.jpg",
    alt: "Client review",
    kicker: "Artisan · 5 of 6",
    title: "Client confirms",
    body: "The client reviews from their account. Confirm releases that stage for payout.",
  },
  {
    image: "/images/hero-client.jpg",
    alt: "Paid work",
    kicker: "Artisan · 6 of 6",
    title: "Get paid per stage",
    body: "Hopayola pays you as a subcontractor (amount minus 5%) after confirm. Transfers need Paystack enabled on the business.",
  },
];

const INTERVAL_MS = 5500;

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
          className="absolute top-3 right-4 z-10 text-paper md:text-ink/40 hover:text-ink text-3xl leading-none"
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
              A short walkthrough — pick a path. It plays like a video.
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
                  Brief, pay, confirm stages, receive the outfit.
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
                  Sign up, claim jobs, submit work, get paid per milestone.
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative aspect-[16/10] bg-ink">
              <Image
                key={frame.image + index}
                src={frame.image}
                alt={frame.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 text-paper">
                <p className="text-royal text-xs uppercase tracking-widest mb-1">
                  {frame.kicker}
                </p>
                <h2 id="demo-title" className="font-display text-2xl md:text-3xl mb-2">
                  {frame.title}
                </h2>
                <p className="text-paper/85 text-sm md:text-base max-w-xl leading-relaxed">
                  {frame.body}
                </p>
              </div>
            </div>

            <div className="px-5 md:px-8 py-4 flex flex-wrap items-center gap-3 border-t border-stone">
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
          </>
        )}
      </div>
    </div>
  );
}
