"use client";

import Image from "next/image";

const strip = [
  "/images/marquee-1.jpg",
  "/images/marquee-2.jpg",
  "/images/marquee-3.jpg",
  "/images/marquee-4.jpg",
  "/images/marquee-5.jpg",
  "/images/marquee-6.jpg",
];

export default function HeroTopStrip() {
  const doubled = [...strip, ...strip];

  return (
    <div className="relative w-full overflow-hidden h-28 md:h-32 mb-8 -mt-4">
      <div
        className="flex gap-4 h-full animate-marquee-left"
        style={{ animationDuration: "40s", width: "max-content" }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            className="relative h-full aspect-[3/4] rounded-xl overflow-hidden shrink-0"
          >
            <Image
              src={src}
              alt="Hopayola fashion"
              fill
              sizes="120px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}