const LINKS = [
  {
    href: "https://www.instagram.com/hopayola",
    label: "Instagram @hopayola",
    path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 15.1 12 3.1 3.1 0 0 1 12 15.1zM17.6 6.1a1.15 1.15 0 1 0 1.15 1.15 1.15 1.15 0 0 0-1.15-1.15z",
  },
  {
    href: "https://www.tiktok.com/@hopayola",
    label: "TikTok @hopayola",
    path: "M14.5 3c.4 2.6 2.1 4.4 4.5 4.7v3.1c-1.5 0-2.9-.5-4.1-1.3v6.6A6.1 6.1 0 1 1 8.8 10v3.2a3 3 0 1 0 2.1 2.9V3h3.6z",
  },
  {
    href: "https://x.com/hopayola",
    label: "X @hopayola",
    path: "M4 4h4.2l4.1 5.6L16.8 4H20l-6.2 8.1L20.4 20h-4.2l-4.5-6.1L7.2 20H4l6.6-8.6L4 4z",
  },
  {
    href: "https://www.facebook.com/hopayolaltd",
    label: "Facebook @hopayola",
    path: "M14 8h3V4h-3c-2.8 0-5 2.2-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.6.4-1 1-1z",
  },
];

export default function SocialIcons({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {LINKS.map((s) => (
        <a
          key={s.href}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          aria-label={s.label}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-current/20 hover:bg-current/10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d={s.path} />
          </svg>
        </a>
      ))}
    </div>
  );
}
