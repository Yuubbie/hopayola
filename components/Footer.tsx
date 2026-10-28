export default function Footer() {
  return (
    <footer className="bg-plum text-paper mt-32">
      <div className="mx-auto max-w-6xl px-6 py-16 grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl mb-3">Hopayola</p>
          <p className="text-paper/70 text-sm">Your fashion network platform</p>
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-paper/40 mb-3">Explore</p>
          <ul className="space-y-2 text-sm text-paper/80">
            <li><a href="/about" className="hover:text-lilac transition-colors">About</a></li>
            <li><a href="/fashion" className="hover:text-lilac transition-colors">Fashion</a></li>
            <li><a href="/lifestyle" className="hover:text-lilac transition-colors">Lifestyle</a></li>
            <li><a href="/shop" className="hover:text-lilac transition-colors">Shop</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-paper/40 mb-3">Account</p>
          <ul className="space-y-2 text-sm text-paper/80">
            <li><a href="/sign-up" className="hover:text-lilac transition-colors">Sign up</a></li>
            <li><a href="/sign-in" className="hover:text-lilac transition-colors">Sign in</a></li>
            <li><a href="/artisan/sign-up" className="hover:text-lilac transition-colors">Artisans, join us</a></li>
            <li><a href="/terms" className="hover:text-lilac transition-colors">Terms &amp; Conditions</a></li>
            <li><a href="/contact" className="hover:text-lilac transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-4 text-sm text-paper/70 flex flex-wrap gap-x-4 gap-y-2">
        <a href="https://www.instagram.com/hopayola" className="hover:text-lilac">
          Instagram @hopayola
        </a>
        <a href="https://www.tiktok.com/@hopayola" className="hover:text-lilac">
          TikTok @hopayola
        </a>
        <a href="https://x.com/hopayola" className="hover:text-lilac">
          X @hopayola
        </a>
        <a href="https://www.facebook.com/hopayolaltd" className="hover:text-lilac">
          Facebook @hopayola
        </a>
        <a href="https://wa.me/2347026888665" className="hover:text-lilac">
          WhatsApp +234 702 688 8665
        </a>
      </div>
      <div className="border-t border-paper/10 py-6 text-center text-xs text-paper/40">
        &copy; {new Date().getFullYear()} Hopayola. Nigeria.
      </div>
    </footer>
  );
}
