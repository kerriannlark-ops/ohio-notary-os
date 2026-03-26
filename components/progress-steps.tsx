export function ProgressSteps({
  steps,
  active,
}: {
  steps: string[];
  active: number;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => (
        <div
          key={step}
          className={`rounded-[22px] px-4 py-3 text-sm ${
            index <= active ? "bg-ink text-parchment" : "bg-parchment/80 text-walnut"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.18em]">Step {index + 1}</p>
          <p className="mt-1">{step}</p>
        </div>
      ))}
    </div>
  );
}
