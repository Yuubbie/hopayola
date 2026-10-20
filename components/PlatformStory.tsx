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

function MiniSidebar({
  active,
  items,
}: {
  active: string;
  items: string[];
}) {
  return (
    <aside className="w-[92px] sm:w-[120px] shrink-0 bg-plum text-paper p-3 flex flex-col gap-1">
      <p className="font-body font-semibold text-[9px] uppercase tracking-[0.2em] text-paper mb-3">
        Hopayola
      </p>
      {items.map((label) => (
        <span
          key={label}
          className={`block rounded-md px-2 py-1.5 text-[10px] leading-tight ${
            label === active
              ? "bg-royal text-paper"
              : "text-paper/55"
          }`}
        >
          {label}
        </span>
      ))}
    </aside>
  );
}

function ClientPreview() {
  return (
    <div className="rounded-2xl overflow-hidden border border-stone shadow-sm bg-paper">
      <div className="flex min-h-[280px]">
        <MiniSidebar
          active="Dashboard"
          items={[
            "Dashboard",
            "My projects",
            "New project",
            "Messages",
            "Settings",
          ]}
        />
        <div className="flex-1 p-4 min-w-0 bg-[#faf8f6]">
          <p className="text-[10px] text-ink/40 mb-1">Your Hopayola workspace</p>
          <p className="font-display text-lg leading-tight mb-3">
            Good morning, Ada
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              ["1", "In progress"],
              ["1", "Needs you"],
              ["0", "Completed"],
            ].map(([n, l]) => (
              <div key={l} className="border border-stone rounded-lg p-2 bg-paper">
                <p className="font-display text-base leading-none">{n}</p>
                <p className="text-[9px] text-ink/45 mt-1">{l}</p>
              </div>
            ))}
          </div>
          <div className="border border-stone rounded-xl p-3 bg-paper">
            <p className="text-[10px] font-medium mb-1">Owambe gown</p>
            <p className="text-[9px] text-ink/50 mb-2">Review the stage photo</p>
            <div className="h-1.5 rounded-full bg-stone overflow-hidden mb-2">
              <div className="h-full w-2/3 bg-royal rounded-full" />
            </div>
            <span className="inline-block bg-royal text-paper text-[9px] rounded-full px-2 py-0.5">
              View project
            </span>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-ink/50 px-4 py-2 border-t border-stone">
        Client workspace — projects, photos, payment held until delivery
      </p>
    </div>
  );
}

function ArtisanPreview() {
  return (
    <div className="rounded-2xl overflow-hidden border border-stone shadow-sm bg-paper">
      <div className="flex min-h-[280px]">
        <MiniSidebar
          active="My jobs"
          items={["Dashboard", "My jobs", "Open jobs", "Payouts", "Messages"]}
        />
        <div className="flex-1 p-4 min-w-0 bg-[#faf8f6]">
          <p className="text-[10px] text-ink/40 mb-1">Your Hopayola workspace</p>
          <p className="font-display text-lg leading-tight mb-3">
            Good morning, Miriam
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              ["2", "Claimed"],
              ["1", "Awaiting photo"],
              ["NGN 18k", "You receive"],
            ].map(([n, l]) => (
              <div key={l} className="border border-stone rounded-lg p-2 bg-paper">
                <p className="font-display text-sm leading-none">{n}</p>
                <p className="text-[9px] text-ink/45 mt-1">{l}</p>
              </div>
            ))}
          </div>
          <div className="border border-royal/30 bg-royal/5 rounded-xl p-3">
            <p className="text-[10px] font-medium mb-1">Needs your action</p>
            <p className="text-[9px] text-ink/60 mb-2">
              Send the sewing-stage photo for Owambe gown
            </p>
            <span className="inline-block bg-royal text-paper text-[9px] rounded-full px-2 py-0.5">
              Upload photo
            </span>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-ink/50 px-4 py-2 border-t border-stone">
        Artisan workspace — jobs, stage photos, 90% payout on delivery
      </p>
    </div>
  );
}

export default function PlatformStory() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-8 md:pb-4">
      <p className="text-royal text-sm mb-3">What Hopayola actually is</p>
      <h2 className="font-display text-3xl md:text-4xl mb-4 max-w-3xl">
        Not a shop. A coordinated studio for custom fashion — with AI in the
        brief, and women artisans on the bench.
      </h2>
      <p className="text-ink/65 max-w-2xl mb-10 leading-relaxed">
        This is the interface after you sign in. Judges and visitors should see
        it here, not only after creating an account.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <ClientPreview />
        <ArtisanPreview />
      </div>

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

      <div className="flex flex-wrap gap-3">
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
    </section>
  );
}
