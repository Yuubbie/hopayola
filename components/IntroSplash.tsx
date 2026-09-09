"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function IntroSplash() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;

    const alreadyShown = sessionStorage.getItem("hopayola_intro_shown");
    if (alreadyShown) return;

    setVisible(true);
    sessionStorage.setItem("hopayola_intro_shown", "true");

    const timer = setTimeout(() => dismiss(), 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function dismiss() {
    setFadingOut(true);
    setTimeout(() => setVisible(false), 500);
  }

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 cursor-pointer overflow-hidden transition-opacity duration-500 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          className="object-cover scale-110 blur-md"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 32%, rgba(61,29,92,0.85) 0%, rgba(10,10,10,0.94) 75%)",
          }}
        />
      </div>

      <div className="relative flex flex-col items-center gap-5">
        <div className="bg-paper rounded-2xl p-6 animate-splash-fade-in">
          <Image
            src="/images/logo.png"
            alt="Hopayola"
            width={80}
            height={80}
            className="h-20 w-auto"
            priority
          />
        </div>
        <p
          className="font-display text-5xl md:text-6xl tracking-tight text-paper animate-splash-fade-in"
          style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
        >
          Hopayola
        </p>
        <p
          className="text-sm md:text-base uppercase tracking-[0.2em] animate-splash-fade-in"
          style={{
            animationDelay: "0.6s",
            animationFillMode: "backwards",
            color: "#C9A9E8",
          }}
        >
          Discover · Design · Connect · Create
        </p>
        <p
          className="absolute -bottom-24 text-paper/70 text-xs uppercase tracking-[0.15em] animate-splash-fade-in"
          style={{ animationDelay: "1.2s", animationFillMode: "backwards" }}
        >
          Tap to continue
        </p>
      </div>
    </div>
  );
}