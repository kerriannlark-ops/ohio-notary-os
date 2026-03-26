interface MetricCardProps {
  label: string;
  value: string;
  note?: string;
}

export function MetricCard({ label, value, note }: MetricCardProps) {
  return (
    <div className="rounded-[24px] border border-black/5 bg-parchment/90 p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-rust/80">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
      {note ? <p className="mt-2 text-sm text-walnut/70">{note}</p> : null}
    </div>
  );
}
