"use client";

import Image from "next/image";

const columnA = [
  "/images/marquee-1.jpg",
  "/images/marquee-2.jpg",
  "/images/marquee-3.jpg",
];

const columnB = [
  "/images/marquee-4.jpg",
  "/images/marquee-5.jpg",
  "/images/marquee-6.jpg",
];

function MarqueeColumn({
  images,
  animationClass,
  duration,
}: {
  images: string[];
  animationClass: string;
  duration: number;
}) {
  const doubled = [...images, ...images];

  return (
    <div className="relative h-full overflow-hidden">
      <div
        className={`flex flex-col gap-4 ${animationClass}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shrink-0"
          >
            <Image
              src={src}
              alt="Hopayola fashion"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroMarquee() {
  return (
    <div className="h-full grid grid-cols-2 gap-4">
      <MarqueeColumn images={columnA} animationClass="animate-marquee-up" duration={26} />
      <MarqueeColumn images={columnB} animationClass="animate-marquee-down" duration={30} />
    </div>
  );
}