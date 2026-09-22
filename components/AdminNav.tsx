"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/artisans", label: "Artisans" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 mb-8 border-b border-stone pb-4">
      {ADMIN_LINKS.map((link) => {
        const isActive = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm rounded-lg px-4 py-1.5 transition-colors ${
              isActive
                ? "bg-royal text-paper"
                : "border border-stone text-ink/60 hover:border-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}