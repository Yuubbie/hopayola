import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SEED_LISTINGS } from "@/lib/seed";

const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Listings</h1>
            <p className="mt-1 text-sm text-ink/55">Demo stock. Your own homes persist after Supabase.</p>
          </div>
          <Link href="/onboard" className="rounded-full bg-moss px-4 py-2 text-sm text-white">
            Add listing
          </Link>
        </div>
        <ul className="mt-8 grid gap-3">
          {SEED_LISTINGS.map((l) => (
            <li
              key={l.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-ink/8 bg-cream px-5 py-4"
            >
              <div>
                <p className="font-medium">{l.title}</p>
                <p className="text-sm text-ink/50">
                  {l.area}, {l.city}
                  <span className="ml-2 rounded-full bg-moss/10 px-2 py-0.5 text-xs capitalize text-moss">
                    {l.intent}
                  </span>
                </p>
              </div>
              <p className="font-serif text-lg">{naira(l.priceNgn)}</p>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
