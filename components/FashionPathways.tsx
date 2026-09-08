import Link from "next/link";
import Image from "next/image";

const pathways = [
  {
    href: "/fashion/hire-a-talent",
    title: "Hire a talent",
    description:
      "Browse tailors, designers, bead artisans and pattern drafters. Work with one professional directly.",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
  },
  {
    href: "/fashion/create-a-team",
    title: "Create a team",
    tag: "Premium",
    description:
      "Let Hopayola assemble and coordinate the right people for your project, so you don't have to.",
    image: "/images/create-a-team.jpg",
  },
  {
    href: "/fashion/design-my-outfit",
    title: "Design my outfit",
    description:
      "Share your measurements, references and occasion. Get styled with guided design support.",
    image: "/images/design-my-outfit.jpg",
  },
];

export default function FashionPathways() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-display text-3xl md:text-4xl mb-2">
        Three ways to start
      </h2>
      <p className="text-ink/60 mb-12 max-w-prose">
        However you like to work, there's a path that fits.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {pathways.map((item) => (
          <Link key={item.href} href={item.href} className="group block">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {item.tag && (
                <span className="absolute top-4 left-4 bg-paper/90 text-ink text-xs px-3 py-1 rounded-full">
                  {item.tag}
                </span>
              )}
            </div>
            <h3 className="font-display text-xl mb-1 group-hover:text-royal transition-colors">
              {item.title}
            </h3>
            <p className="text-ink/60 text-sm leading-relaxed">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}