import Link from "next/link";

export default function SeoArticle({
  title,
  lede,
  children,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <main>
      <section className="bg-ink text-paper py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 md:px-10">
          <h1 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-paper/75 leading-relaxed">{lede}</p>
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-6 md:px-10 py-16 md:py-20 space-y-6 text-ink/75 leading-relaxed text-sm md:text-base">
        {children}
        <p className="pt-4">
          <Link
            href={ctaHref}
            className="inline-block bg-royal text-paper rounded-full px-6 py-2.5 text-sm hover:bg-royal-deep"
          >
            {ctaLabel}
          </Link>
        </p>
      </article>
    </main>
  );
}
