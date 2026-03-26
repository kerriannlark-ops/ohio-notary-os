interface ComplianceBannerProps {
  items: string[];
  title?: string;
}

export function ComplianceBanner({
  items,
  title = "Compliance attention",
}: ComplianceBannerProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[24px] border border-rust/20 bg-rust/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rust">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-rust">
        {items.map((item) => (
          <li key={item}>- {item.replaceAll("_", " ")}</li>
        ))}
      </ul>
    </div>
  );
}
