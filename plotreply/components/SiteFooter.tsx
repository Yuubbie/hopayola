import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ink/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p className="text-sm text-ink/50">
          English nationwide · Never collects rent or deposits in chat
        </p>
      </div>
    </footer>
  );
}
