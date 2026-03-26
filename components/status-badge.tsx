interface StatusBadgeProps {
  label: string;
  tone?: "default" | "warning" | "success" | "danger" | "brand";
}

const toneClasses: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  default: "bg-ink/8 text-ink",
  warning: "bg-brass/20 text-walnut",
  success: "bg-spruce/15 text-spruce",
  danger: "bg-rust/15 text-rust",
  brand: "bg-[#e7d6b6] text-walnut",
};

export function StatusBadge({ label, tone = "default" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${toneClasses[tone]}`}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}
