import Link from "next/link";

export default function DashboardPlaceholder({
  title,
  description,
  points,
}: {
  title: string;
  description: string;
  points?: string[];
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-royal text-sm mb-3">Coming soon</p>
      <h1 className="font-display text-3xl md:text-4xl mb-4">{title}</h1>
      <p className="text-ink/65 leading-relaxed mb-8">{description}</p>

      {points && points.length > 0 && (
        <ul className="space-y-3 mb-10 text-sm text-ink/70">
          {points.map((point) => (
            <li key={point} className="flex gap-3">
              <span className="text-royal mt-px">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/account"
          className="bg-royal text-paper px-5 py-2.5 rounded-full text-sm hover:bg-royal-deep transition-colors"
        >
          Back to dashboard
        </Link>
        <Link
          href="/projects/new"
          className="border border-ink/15 px-5 py-2.5 rounded-full text-sm hover:border-royal hover:text-royal transition-colors"
        >
          Start a project
        </Link>
      </div>
    </div>
  );
}
