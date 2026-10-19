import Link from "next/link";

const pillars = [
  {
    title: "AI design studio",
    body: "You describe the occasion and send a photo of your fabric. Hopayola turns that into design concepts you can actually choose — not a mood board, a brief your artisan can sew from.",
  },
  {
    title: "Women artisans, paid fairly",
    body: "Verified tailors and designers in Abuja. They work from a real job board, send stage photos from their phone, and are paid 90% of the project when you confirm the finished outfit.",
  },
  {
    title: "Two workspaces, one project",
    body: "Clients and artisans each have a dashboard: to-dos, messages, photos, and payouts. You are not managing five people on WhatsApp. Hopayola holds the money until the garment is in your hands.",
  },
];

export default function PlatformStory() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-8 md:pb-4">
      <p className="text-royal text-sm mb-3">What Hopayola actually is</p>
      <h2 className="font-display text-3xl md:text-4xl mb-4 max-w-3xl">
        Not a shop. A coordinated studio for custom fashion — with AI in the
        brief, and women artisans on the bench.
      </h2>
      <p className="text-ink/65 max-w-2xl mb-10 leading-relaxed">
        Visitors only see the homepage. The dashboards, the concepts, and the
        payouts live behind sign-in. This is that picture, in public.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {pillars.map((item) => (
          <div
            key={item.title}
            className="border border-stone rounded-2xl p-6"
          >
            <h3 className="font-display text-xl mb-2">{item.title}</h3>
            <p className="text-sm text-ink/65 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="border border-stone rounded-2xl p-6 md:p-8 bg-stone/30">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/45 mb-4">
          After you sign in
        </p>
        <div className="grid sm:grid-cols-2 gap-8 text-sm">
          <div>
            <p className="font-medium mb-2">Client workspace</p>
            <ul className="text-ink/65 space-y-1.5">
              <li>Choose a concept the studio generated for your fabric</li>
              <li>Send fabric, pay once, review stage photos</li>
              <li>Confirm delivery — that is when the artisan is paid</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">Artisan workspace</p>
            <ul className="text-ink/65 space-y-1.5">
              <li>Claim open jobs in your city</li>
              <li>Upload a photo for each stage from your phone</li>
              <li>See the 10% Hopayola fee and the 90% you will receive</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link
            href="/sign-up"
            className="bg-royal text-paper px-5 py-2.5 rounded-full text-sm hover:bg-royal-deep transition-colors"
          >
            Open a client account
          </Link>
          <Link
            href="/artisan/sign-up"
            className="border border-ink/20 px-5 py-2.5 rounded-full text-sm hover:border-royal hover:text-royal transition-colors"
          >
            Join as an artisan
          </Link>
        </div>
      </div>
    </section>
  );
}
