import Link from "next/link";

export function Mark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="10" fill="#16382A" />
      <path
        d="M10 12h12v8H10zM24 12h6v16H10v-6h14z"
        fill="none"
        stroke="#E8D5A3"
        strokeWidth="1.6"
      />
      <path d="M14 28h16l-4 5v-5" fill="#5D9B7A" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-ink no-underline">
      <Mark />
      {!compact && (
        <span className="font-serif text-xl tracking-tight">
          Plot<span className="text-moss">Reply</span>
        </span>
      )}
    </Link>
  );
}
