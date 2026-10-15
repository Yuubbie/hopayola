import Link from "next/link";

export default function DashboardPlaceholder({
  title,
  description,
  points,
  backHref = "/account",
  backLabel = "Back to dashboard",
  secondary = { href: "/projects/new", label: "Start a project" },
}: {
  title: string;
  description: string;
  points?: string[];
  backHref?: string;
  backLabel?: string;
  secondary?: { href: string; label: string } | null;
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
          href={backHref}
          className="bg-royal text-paper px-5 py-2.5 rounded-full text-sm hover:bg-royal-deep transition-colors"
        >
          {backLabel}
        </Link>
        {secondary && (
          <Link
            href={secondary.href}
            className="border border-ink/15 px-5 py-2.5 rounded-full text-sm hover:border-royal hover:text-royal transition-colors"
          >
            {secondary.label}
          </Link>
        )}
      </div>
    </div>
  );
}
