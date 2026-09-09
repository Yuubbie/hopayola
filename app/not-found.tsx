import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-royal text-sm mb-4">404</p>
      <h1 className="font-display text-4xl md:text-5xl mb-6">
        This page doesn't exist yet.
      </h1>
      <p className="text-ink/60 max-w-prose mb-10">
        The page you're looking for might have moved, or it's still being
        built. Let's get you back on track.
      </p>
      <Link
        href="/"
        className="bg-royal text-paper px-6 py-3 rounded-full hover:bg-royal-deep transition-colors"
      >
        Back to homepage
      </Link>
    </main>
  );
}