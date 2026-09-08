"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
      <div
        className={`transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-royal text-sm mb-4">Now piloting in Abuja</p>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-6">
          Your fashion idea, planned and coordinated from start to finish.
        </h1>
        <p className="text-ink/70 max-w-prose text-lg leading-relaxed mb-8">
          Hopayola connects you with tailors, designers and artisans, then
          coordinates the entire project so you're not managing five people
          on your own.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/fashion/hire-a-talent"
            className="bg-royal text-paper px-6 py-3 rounded-full hover:bg-royal-deep transition-colors"
          >
            Hire a talent
          </Link>
          <Link
            href="/fashion/design-my-outfit"
            className="border border-ink/20 px-6 py-3 rounded-full hover:border-royal hover:text-royal transition-colors"
          >
            Design my outfit
          </Link>
        </div>
      </div>

      <div
        className={`relative aspect-[4/5] rounded-3xl overflow-hidden transition-all duration-1000 ease-out delay-150 ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <Image
          src="/images/hero.jpg"
          alt="Fashion design and tailoring in progress"
          fill
          className="object-cover"
          priority
        />
      </div>
    </section>
  );
}