import Link from "next/link";

const OCCASIONS = [
  {
    label: "Wedding",
    slug: "Wedding",
    blurb: "Aso ebi, gowns, and the big day look",
    image: "/images/occasion-wedding.jpg",
  },
  {
    label: "Owambe / Party",
    slug: "Owambe%20%2F%20Party",
    blurb: "Bold, statement pieces for the dance floor",
    image: "/images/occasion-owambe.jpg",
  },
  {
    label: "Naming Ceremony",
    slug: "Naming%20Ceremony",
    blurb: "Family occasions, done with care",
    image: "/images/occasion-naming.jpg",
  },
  {
    label: "Corporate / Work",
    slug: "Corporate%20%2F%20Work",
    blurb: "Sharp, professional, well cut",
    image: "/images/occasion-corporate.jpg",
  },
  {
    label: "Everyday Wear",
    slug: "Everyday%20Wear",
    blurb: "Comfortable pieces made to your fit",
    image: "/images/occasion-everyday.jpg",
  },
  {
    label: "Cultural / Festival",
    slug: "Cultural%20%2F%20Festival",
    blurb: "Traditional wear for the moments that matter",
    image: "/images/occasion-cultural.jpg",
  },
];

export default function OccasionBrowse() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-display text-3xl md:text-4xl mb-2">
        What are you dressing for?
      </h2>
      <p className="text-ink/60 mb-12 max-w-prose">
        Tell us the occasion and we will start your project from there.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {OCCASIONS.map((item) => (
          <Link
            key={item.slug}
            href={`/projects/new?occasion=${item.slug}`}
            className="group relative aspect-square rounded-2xl overflow-hidden block transition-transform duration-300 hover:scale-[1.02]"
          >
            <img
              src={item.image}
              alt={item.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="font-display text-lg md:text-xl leading-tight mb-1 text-paper">
                {item.label}
              </h3>
              <p className="text-xs md:text-sm leading-snug text-paper opacity-80">
                {item.blurb}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}