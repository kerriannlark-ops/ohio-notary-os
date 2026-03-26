import Link from "next/link";
import { ReactNode } from "react";

const portalNav = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/appointments", label: "Appointments" },
  { href: "/portal/quotes", label: "Quotes" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/checklist", label: "Checklist" },
  { href: "/portal/invoices", label: "Invoices" },
  { href: "/portal/messages", label: "Messages" },
  { href: "/portal/history", label: "History" },
] as const;

export function PortalShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-white/80 p-6 shadow-card">
        <p className="text-xs uppercase tracking-[0.26em] text-rust">Client portal</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-4xl text-ink">{title}</h1>
          <div className="flex flex-wrap gap-2">
            {portalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full bg-parchment px-4 py-2 text-sm text-walnut"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      {children}
    </div>
  );
}
