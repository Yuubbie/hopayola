import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Hopayola",
  description:
    "Hopayola Platform Terms and Conditions for Artisans and Service Providers.",
};

export default function Terms() {
  return (
    <main>
      <section className="bg-ink text-paper py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-display text-4xl md:text-5xl mb-6">
            Hopayola Platform Terms and Conditions
          </h1>
          <p className="text-paper/70">Artisans &amp; Service Providers</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 space-y-14 text-sm text-ink/80 leading-relaxed">
        <div>
          <h2 className="font-display text-2xl mb-4 text-ink">
            1. Scope &amp; Acceptance
          </h2>
          <p>
            These Terms govern all registered artisans, tailors,
            embellishers, pattern makers, and independent designers
            (&quot;Artisans&quot;) operating on Hopayola. By accepting
            commissions, listing services, or receiving payouts via the
            platform, you agree to comply with these operational, legal, and
            financial standards.
          </p>
          <p className="mt-3">
            Hopayola Ltd (the &quot;Company&quot;) is the merchant of record
            for all projects commissioned through the Platform. Clients
            contract with the Company, not with individual artisans. The
            Company is a digital fashion and production management
            enterprise, not a bank, financial institution, trustee, or
            licensed settlement service under the Banks and Other Financial
            Institutions Act (BOFIA) or Central Bank of Nigeria (CBN)
            regulations.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl mb-4 text-ink">
            2. Quality Standards, Performance Ratings &amp; Account
            Suspension
          </h2>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Rating Benchmark:</strong> Artisans must maintain an
              average customer rating of at least 3.8 out of 5 stars across
              rolling 30-day windows.
            </li>
            <li>
              <strong>Low-Rating Triggers:</strong> Receiving multiple
              sub-3-star reviews for sizing discrepancies, unfinished seams,
              late delivery, or unapproved material substitutions initiates
              an internal quality audit.
            </li>
            <li>
              <strong>Suspension &amp; Offboarding:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>
                  First Infraction / Tier 1: Temporary suspension of new
                  incoming job requests for 14 days, with mandatory review of
                  platform tailoring standards.
                </li>
                <li>
                  Repeated Infractions / Tier 2: Permanent deactivation of
                  the artisan profile, forfeiture of platform verification
                  badges, and cancellation of active bids.
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl mb-4 text-ink">
            3. Financial Structure, Platform Fees &amp; Maintenance
            Deductions
          </h2>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Title to payments:</strong> Payments made by clients
              are processed by the Company&apos;s payment partners (including
              Paystack). Title to those payments passes to the Company upon
              receipt and settlement. No client funds are held in trust,
              segregated fiduciary custody, or on behalf of any artisan or
              third party.
            </li>
            <li>
              <strong>Advance project funding:</strong> Production is
              scheduled across defined project phases (&quot;Milestones&quot;).
              Amounts paid for a project or milestone constitute the
              Company&apos;s earned or deferred project revenue, allocated
              toward materials, pattern work, fittings, platform operations,
              and subcontractor compensation.
            </li>
            <li>
              <strong>Artisans as subcontractors:</strong> Verified artisans
              are independent subcontractors of the Company. They have no
              proprietary claim over customer payments and look exclusively
              to the Company for payment of agreed fabrication fees. The
              Company retains sole discretion over scheduling and
              disbursement of those fees.
            </li>
            <li>
              <strong>Commission &amp; Maintenance Fee:</strong> The Company
              charges a client service fee at checkout (currently 5% of
              milestone totals) and applies a platform commission (currently
              5%) deducted from each artisan work-order amount. These fees
              cover payment processing, platform hosting, AI render
              pipelines, marketing, customer support, and dispute
              arbitration. On Premium team projects, commission is
              calculated on each team member&apos;s own milestone amount.
            </li>
            <li>
              <strong>Conditional milestone disbursements:</strong>{" "}
              Subcontractor compensation is paid on a completed-phase basis
              after verification (for example Intake/Cutting, Assembly,
              Final Quality Check/Fitting). Disbursements are made to the
              artisan&apos;s verified bank account via the Company&apos;s
              designated payout mechanisms (Paystack Transfers). Payout
              requires: (i) the client (or deemed acceptance after the
              stated review window) confirming the milestone, or Company
              verification; (ii) no open dispute on that phase; and (iii) a
              verified payout account on file.
            </li>
            <li>
              <strong>Chargebacks &amp; Rework Deductions:</strong> If a
              garment fails verified quality checks due to artisan error or
              negligence, the Company may withhold or debit subcontractor
              fees for the affected milestone. Remediation costs (alteration
              fees, courier return fees, or client refunds) may be deducted
              from the artisan&apos;s pending payout ledger.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl mb-4 text-ink">
            4. Platform Exclusivity &amp; Anti-Circumvention (Off-Platform
            Contact)
          </h2>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>In-App Communication Requirement:</strong> All client
              communications, fitting updates, style alterations, deadline
              extensions, and progress photos must be logged directly within
              the Hopayola project dashboard.
            </li>
            <li>
              <strong>Prohibited Off-Platform Transactions:</strong>
              Soliciting clients to pay via private bank transfers, cash, or
              alternative channels outside of Hopayola&apos;s Paystack
              checkout is strictly prohibited.
            </li>
            <li>
              <strong>External Contact Disclosure:</strong> If an artisan
              communicates with a client via phone, WhatsApp, or in-person
              fitting, the artisan must log a written summary of any agreed
              changes or status updates onto the Hopayola dashboard within
              12 hours.
            </li>
            <li>
              <strong>Penalties for Circumvention:</strong> Bypassing
              platform payment or communication channels results in
              immediate account termination, withholding of pending platform
              payouts, and potential legal recovery of lost commission fees.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl mb-4 text-ink">
            5. Client Data Privacy &amp; Non-Disclosure
          </h2>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Confidential Information:</strong> Client body
              measurements, home addresses, phone numbers, email addresses,
              and personal reference images are strictly confidential.
            </li>
            <li>
              <strong>Prohibition on Public Sharing:</strong> Artisans may
              not post client photos, measurements, personal identities, or
              raw fitting footage on personal social media (Instagram,
              TikTok, Facebook, etc.) or portfolio sites without prior
              written consent logged on the platform.
            </li>
            <li>
              <strong>Data Misuse Penalties:</strong> Unlawfully sharing,
              selling, or leaking client data triggers immediate platform
              expulsion, reporting to relevant data privacy authorities, and
              liability for civil damages.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl mb-4 text-ink">
            6. Fabric Care, Custody &amp; Loss Liability
          </h2>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Custody Responsibility:</strong> The artisan assumes
              full financial responsibility for customer fabric from the
              moment physical intake is confirmed (via drop-off hub or
              verified courier) until final garment handoff.
            </li>
            <li>
              <strong>Fabric Damage or Ruin:</strong> If fabric is burned,
              stained, cut contrary to approved specifications, or
              misplaced while in the artisan&apos;s possession, the artisan
              must reimburse the client for the full verified retail value
              of the yardage. The equivalent amount will be debited from the
              artisan&apos;s platform balance.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl mb-4 text-ink">
            7. Turnaround Timelines &amp; Delivery Penalties
          </h2>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Agreed Timelines:</strong> Production deadlines agreed
              upon during project intake and bidding are legally binding.
            </li>
            <li>
              <strong>Delay Notification:</strong> Unavoidable delays (e.g.,
              machinery breakdown, power outage) must be reported via the
              project dashboard at least 48 hours before the milestone
              deadline.
            </li>
            <li>
              <strong>Unexcused Delays:</strong> Unreported delivery delays
              incur an automatic platform late-fee deduction of 5% per day
              past deadline, credited back to the affected client.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl mb-4 text-ink">
            8. Intellectual Property &amp; Showcase Rights
          </h2>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Hopayola Content:</strong> All proprietary digital
              sketches, AI-generated design concepts, print patterns, and
              croquis downloaded from or generated by Hopayola remain the
              intellectual property of Hopayola or its licensors. Artisans
              receive a limited production license solely to construct the
              specific commissioned garment.
            </li>
            <li>
              <strong>Portfolio Showcase Rights:</strong> Hopayola reserves
              the right to display high-quality photographs of completed
              client garments on the public platform showcase, Style
              Arcade, and marketing campaigns, with appropriate artisan
              craftsmanship attribution.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl mb-4 text-ink">
            9. Dispute Resolution &amp; Platform Arbitration
          </h2>
          <p>
            In the event of a dispute regarding fit, construction quality,
            or delivery status, both the client and artisan agree to submit
            to Hopayola&apos;s Internal Quality Arbitration. Hopayola&apos;s
            physical inspection team reserves the right to evaluate the
            garment against the approved project brief, measurement
            profile, and uploaded fabric photos. The arbitration
            team&apos;s decision regarding payout, rework, or refund
            issuance is final and binding.
          </p>
        </div>
      </section>
    </main>
  );
}
