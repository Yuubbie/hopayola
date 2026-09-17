import Link from "next/link";
import AfricanPattern from "@/components/AfricanPattern";

const OCCASIONS = [
  {
    label: "Wedding",
    slug: "Wedding",
    blurb: "Aso ebi, gowns, and the big day look",
    bg: "bg-royal",
    text: "text-paper",
  },
  {
    label: "Owambe / Party",
    slug: "Owambe%20%2F%20Party",
    blurb: "Bold, statement pieces for the dance floor",
    bg: "bg-royal-deep",
    text: "text-paper",
  },
  {
    label: "Naming Ceremony",
    slug: "Naming%20Ceremony",
    blurb: "Family occasions, done with care",
    bg: "bg-stone",
    text: "text-ink",
  },
  {
    label: "Corporate / Work",
    slug: "Corporate%20%2F%20Work",
    blurb: "Sharp, professional, well cut",
    bg: "bg-ink",
    text: "text-paper",
  },
  {
    label: "Everyday Wear",
    slug: "Everyday%20Wear",
    blurb: "Comfortable pieces made to your fit",
    bg: "bg-stone",
    text: "text-ink",
  },
  {
    label: "Cultural / Festival",
    slug: "Cultural%20%2F%20Festival",
    blurb: "Traditional wear for the moments that matter",
    bg: "bg-royal",
    text: "text-paper",
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
            className={`group relative aspect-square rounded-2xl overflow-hidden block ${item.bg} transition-transform duration-300 hover:scale-[1.02]`}
          >
            <div className="absolute inset-0">
              <AfricanPattern
                color={item.text === "text-paper" ? "#FAFAF8" : "#5B2A86"}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3
                className={`font-display text-lg md:text-xl leading-tight mb-1 ${item.text}`}
              >
                {item.label}
              </h3>
              <p
                className={`text-xs md:text-sm leading-snug ${item.text} opacity-70`}
              >
                {item.blurb}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}