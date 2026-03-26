import Link from "next/link";

const dashboardNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/launch", label: "Launch Plan" },
  { href: "/dashboard/compliance", label: "Compliance" },
  { href: "/dashboard/revenue", label: "Revenue" },
] as const;

export function DashboardNav() {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {dashboardNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="shrink-0 rounded-full bg-parchment px-4 py-2 text-sm text-walnut"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
