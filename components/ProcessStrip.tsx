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
        <h2 className="font-display text-3xl md:text-4xl mb-12">
          Every project moves through the same clear stages
        </h2>
        <div className="flex flex-wrap items-start gap-y-8">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="text-center px-3">
                <div className="font-display italic text-3xl text-royal">
                  {i + 1}
                </div>
                <div className="text-paper/80 text-sm mt-1">{step}</div>
              </div>
              {i < steps.length - 1 && (
                <span className="text-paper/20 text-lg">&#8594;</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-paper/50 text-sm mt-10 max-w-prose">
          You'll always know exactly where your project stands and who's
          responsible for the current step.
        </p>
      </div>
    </section>
  );
}