import Link from "next/link";

import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { formatCurrency } from "@/lib/formatters";
import { dashboardMetrics, mockAppointments } from "@/lib/mockData";

export default function AnalyticsPage() {
  const travelRevenue = mockAppointments
    .filter((appointment) => appointment.travelMiles > 0)
    .reduce((total, appointment) => total + appointment.total, 0);
  const ronRevenue = mockAppointments
    .filter((appointment) => appointment.serviceMode === "ron")
    .reduce((total, appointment) => total + appointment.total, 0);
  const topZipCodes = Object.entries(
    mockAppointments.reduce<Record<string, number>>((accumulator, appointment) => {
      accumulator[appointment.zip] = (accumulator[appointment.zip] ?? 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Travel revenue" value={formatCurrency(travelRevenue)} />
        <MetricCard label="RON revenue" value={formatCurrency(ronRevenue)} />
        <MetricCard label="Completed" value={`${dashboardMetrics.completed}`} />
        <MetricCard label="Refused" value={`${dashboardMetrics.refused}`} />
      </div>
      <SectionCard title="Top zip codes" eyebrow="Routing">
        <div className="mb-5 flex flex-wrap gap-2">
          <Link
            href="/api/export/revenue-csv"
            className="rounded-full bg-ink px-4 py-2 text-sm text-parchment"
          >
            Revenue CSV
          </Link>
          <Link
            href="/api/export/mileage-csv"
            className="rounded-full bg-parchment px-4 py-2 text-sm text-walnut"
          >
            Mileage CSV
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {topZipCodes.map(([zip, count]) => (
            <div key={zip} className="rounded-[22px] bg-parchment/80 p-4">
              <p className="text-lg font-semibold text-ink">{zip}</p>
              <p className="text-sm text-walnut/75">{count} appointments</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
