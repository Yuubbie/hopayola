const steps = [
  "Consultation",
  "Measurements",
  "Design",
  "Pattern",
  "Cutting",
  "Sewing",
  "Delivery",
];

export default function ProcessStrip() {
  return (
    <section className="bg-ink text-paper py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-royal text-sm mb-3">The path</p>
        <h2 className="font-display text-3xl md:text-4xl mb-12 max-w-2xl">
          Every project moves through the same clear stages
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {steps.map((step, i) => (
            <div
              key={step}
              className="rounded-2xl border border-paper/10 bg-paper/5 px-3 py-4 text-center"
            >
              <div className="font-display italic text-2xl text-royal mb-1">
                {i + 1}
              </div>
              <div className="text-paper/85 text-sm">{step}</div>
            </div>
          ))}
        </div>
        <p className="text-paper/50 text-sm mt-10 max-w-prose">
          You&apos;ll always know exactly where your project stands and who is
          responsible for the current step.
        </p>
      </div>
    </section>
  );
}
