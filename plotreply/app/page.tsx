import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Mark } from "@/components/Logo";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/60 px-3 py-1 text-xs font-medium tracking-wide text-moss">
              <Mark className="h-4 w-4" /> Nigeria · rent · sale · short-let
            </p>
            <h1 className="font-serif text-4xl font-medium leading-[1.15] md:text-5xl">
              Every “how much?” answered.
              <span className="block text-moss">You only meet serious people.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/70">
              PlotReply is the WhatsApp desk for agents and hosts. It qualifies budget and area,
              sends live listings, and books inspections or short-let dates. It never takes
              payment.
            </p>
            <p className="mt-4 text-sm text-ink/55">
              Send CEOs <span className="font-medium text-ink">/demo</span> — they paste their
              website, copy a private link, and clients browse that catalogue then chat what they
              want.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/demo"
                className="rounded-full bg-moss px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-ink"
              >
                Talk to the inbox
              </Link>
              <Link
                href="/onboard"
                className="rounded-full border border-ink/15 bg-white px-6 py-3 text-sm hover:border-moss"
              >
                Add a listing
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-ink/10 bg-ink p-3 shadow-xl">
            <div className="flex items-center gap-3 rounded-t-2xl px-3 py-2 text-sand/80">
              <Mark className="h-8 w-8" />
              <div>
                <p className="text-sm font-medium text-sand">PlotReply</p>
                <p className="text-[11px] text-sand/50">Always on · never asks for transfer</p>
              </div>
            </div>
            <div className="space-y-2.5 rounded-2xl bg-[#ece5dd] p-4 text-[13px] leading-snug">
              <div className="ml-8 rounded-2xl rounded-tr-sm bg-white px-3 py-2 shadow-sm">
                2 bedroom Lekki rent 4m
              </div>
              <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#d9fdd3] px-3 py-2 shadow-sm">
                Live now:
                <br />
                <span className="font-medium">2-bed serviced estate — Lekki Phase 1</span>
                <br />
                ₦4,500,000 / year · prepaid · 10% agency
                <br />
                Send a day to inspect. Do not pay in this chat.
              </div>
              <div className="ml-8 rounded-2xl rounded-tr-sm bg-white px-3 py-2 shadow-sm">
                Saturday 1pm
              </div>
              <div className="mr-6 rounded-2xl rounded-tl-sm bg-[#d9fdd3] px-3 py-2 shadow-sm">
                Saturday 1pm held. Landmark + ID reminder goes out 2 hours before. The agent only
                wakes for this slot.
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-ink/8 bg-cream">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-3">
            {[
              ["01", "They chat", "Budget, area, rent / buy / short-let — answered in seconds."],
              ["02", "You approve the facts", "Prices and fees come from your listings. The bot does not invent."],
              ["03", "Only serious people", "Inspection or dates booked. Time-wasters stay in the thread."],
            ].map(([n, t, d]) => (
              <div key={n}>
                <p className="font-serif text-gold">{n}</p>
                <h2 className="mt-2 font-serif text-xl">{t}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-serif text-3xl">Simple naira pricing</h2>
          <p className="mt-2 text-ink/60">First month ₦10,000 to go live. Then pick a plan.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Try", "₦10k", "First month", "1 WhatsApp line · 15 listings · rent or short-let"],
              ["Solo", "₦25k", "/ month", "Rent + short-let · 40 listings · you are not in the chat"],
              ["Agency", "₦55k", "/ month", "3 users · sale inspections · weekly report"],
            ].map(([name, price, cadence, blurb]) => (
              <div
                key={name}
                className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wider text-moss">{name}</p>
                <p className="mt-3 font-serif text-4xl">{price}</p>
                <p className="text-sm text-ink/45">{cadence}</p>
                <p className="mt-4 text-sm text-ink/70">{blurb}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
