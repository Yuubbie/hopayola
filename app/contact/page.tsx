import type { Metadata } from "next";
import { submitInquiry } from "./actions";

export const metadata: Metadata = {
  title: "Contact — Hopayola",
  description:
    "Get in touch with Hopayola for custom commissions, partner onboarding, or platform questions.",
};

const ROLE_OPTIONS = [
  "Client",
  "Fashion Artisan / Tailor",
  "Independent Designer",
  "Media / Partnership",
];

export default function Contact() {
  return (
    <main>
      <section className="bg-ink text-paper py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-display text-4xl md:text-5xl mb-6">
            Get in Touch with Hopayola.
          </h1>
          <p className="text-paper/70 max-w-prose mx-auto leading-relaxed">
            Whether you have questions about custom commissions, partner
            onboarding, or platform features, our team is ready to assist.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="font-display text-2xl mb-6">Direct Channels</h2>
          <ul className="space-y-4 text-ink/70 text-sm">
            <li>
              <span className="block text-ink/40 text-xs uppercase tracking-widest mb-1">
                Client Inquiries &amp; Support
              </span>
              <a href="mailto:support@hopayola.com" className="hover:text-royal transition-colors">
                support@hopayola.com
              </a>
            </li>
            <li>
              <span className="block text-ink/40 text-xs uppercase tracking-widest mb-1">
                Artisan &amp; Designer Onboarding
              </span>
              <a href="mailto:partners@hopayola.com" className="hover:text-royal transition-colors">
                partners@hopayola.com
              </a>
            </li>
            <li>
              <span className="block text-ink/40 text-xs uppercase tracking-widest mb-1">
                WhatsApp / Direct Line
              </span>
              +234 702 688 8665
            </li>
            <li>
              <span className="block text-ink/40 text-xs uppercase tracking-widest mb-1">
                Primary Operations Hub
              </span>
              Abuja, Federal Capital Territory, Nigeria
            </li>
          </ul>

          <h2 className="font-display text-2xl mt-12 mb-6">
            Quick Support FAQs
          </h2>
          <div className="space-y-6 text-sm">
            <div>
              <p className="font-medium mb-1">
                How are fabric handoffs managed?
              </p>
              <p className="text-ink/70 leading-relaxed">
                Arrange scheduled courier pickup during project checkout.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">
                How do milestone releases work?
              </p>
              <p className="text-ink/70 leading-relaxed">
                Your payment is held securely in escrow and released to the
                artisan only after you review and approve specific
                production milestones.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">
                How do I send accurate body measurements?
              </p>
              <p className="text-ink/70 leading-relaxed">
                Follow our measurement guide to get accurate results before
                starting your project.
              </p>
            </div>
          </div>
        </div>

        <form action={submitInquiry} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              required
              className="w-full border border-stone rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border border-stone rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Phone / WhatsApp
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full border border-stone rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              I am a...
            </label>
            <select
              name="role"
              required
              className="w-full border border-stone rounded-lg px-4 py-2.5 text-sm"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              required
              className="w-full border border-stone rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Message
            </label>
            <textarea
              name="message"
              required
              rows={5}
              className="w-full border border-stone rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            className="bg-royal text-paper rounded-full px-6 py-3 text-sm hover:bg-royal-deep transition-colors"
          >
            Send Message
          </button>
        </form>
      </section>
    </main>
  );
}