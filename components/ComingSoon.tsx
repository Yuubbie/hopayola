import Link from "next/link";

export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
  interest?: "hire_talent" | "create_team" | "design_outfit";
}) {
  return (
    <main className="mx-auto max-w-xl px-6 py-32 text-center">
      <p className="text-royal text-sm mb-4">Coming soon</p>
      <h1 className="font-display text-4xl mb-4">{title}</h1>
      <p className="text-ink/70 leading-relaxed mb-10">{description}</p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/projects/new"
          className="bg-royal text-paper px-6 py-3 rounded-full hover:bg-royal-deep transition-colors"
        >
          Start a project
        </Link>
        <Link
          href="/artisan/sign-up"
          className="border border-ink/20 px-6 py-3 rounded-full hover:border-royal hover:text-royal transition-colors"
        >
          Join as artisan
        </Link>
      </div>
    </main>
  );
}
