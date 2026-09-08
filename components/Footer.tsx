export default function Footer() {
  return (
    <footer className="bg-ink text-paper mt-32">
      <div className="mx-auto max-w-6xl px-6 py-16 grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl mb-3">Hopayola</p>
          <p className="text-paper/70 text-sm">Fashion, thoughtfully orchestrated.</p>
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-paper/40 mb-3">Explore</p>
          <ul className="space-y-2 text-sm text-paper/80">
            <li><a href="/about" className="hover:text-royal transition-colors">About</a></li>
            <li><a href="/fashion" className="hover:text-royal transition-colors">Fashion</a></li>
            <li><a href="/lifestyle" className="hover:text-royal transition-colors">Lifestyle</a></li>
            <li><a href="https://shop.hopayola.com" className="hover:text-royal transition-colors">Shop</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-paper/40 mb-3">Account</p>
          <ul className="space-y-2 text-sm text-paper/80">
            <li><a href="/sign-up" className="hover:text-royal transition-colors">Sign up</a></li>
            <li><a href="/sign-in" className="hover:text-royal transition-colors">Sign in</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10 py-6 text-center text-xs text-paper/40">
        &copy; {new Date().getFullYear()} Hopayola. Abuja, Nigeria.
      </div>
    </footer>
  );
}