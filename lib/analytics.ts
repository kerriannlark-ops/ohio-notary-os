import { createOhioQuote } from "./pricing";
import { mockAppointments } from "./mockData";

export function getAnalyticsSummary() {
  const revenueByServiceLine = mockAppointments.reduce<Record<string, number>>(
    (accumulator, appointment) => {
      accumulator[appointment.serviceType] =
        (accumulator[appointment.serviceType] ?? 0) + appointment.total;
      return accumulator;
    },
    {},
  );

  const topZipCodes = Object.entries(
    mockAppointments.reduce<Record<string, number>>((accumulator, appointment) => {
      accumulator[appointment.zip] = (accumulator[appointment.zip] ?? 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([zip, count]) => ({ zip, count }));

  const quoteBreakdowns = mockAppointments.map((appointment) =>
    createOhioQuote({
      actType: appointment.serviceType,
      actCount: appointment.actCount,
      isRON: appointment.serviceMode === "ron",
      ronAuthorized: appointment.serviceMode === "ron",
      travelMiles: appointment.travelMiles,
      travelFeeAccepted: appointment.travelMiles > 0,
      isAfterHours: appointment.afterHours,
      techFeeRequested: appointment.serviceMode === "ron" ? 10 : 0,
    }),
  );

  const travelFeeRevenue = quoteBreakdowns.reduce((total, quote) => {
    const travelFee = quote.lineItems.find((item) => item.code === "travel_fee")?.amount ?? 0;
    return total + travelFee;
  }, 0);

  const ronRevenue = quoteBreakdowns.reduce((total, quote, index) => {
    return total + (mockAppointments[index]?.serviceMode === "ron" ? quote.total : 0);
  }, 0);

  const bookedStatuses = new Set(["booked", "completed", "follow_up_needed", "quoted"]);
  const bookedCount = mockAppointments.filter((appointment) =>
    bookedStatuses.has(appointment.status),
  ).length;
  const completedCount = mockAppointments.filter(
    (appointment) => appointment.status === "completed",
  ).length;

  return {
    leads: mockAppointments.length,
    bookedCount,
    completedCount,
    cancelledCount: mockAppointments.filter(
      (appointment) =>
        appointment.status === "cancelled" || appointment.status === "no_show",
    ).length,
    refusedCount: mockAppointments.filter(
      (appointment) => appointment.status === "refused",
    ).length,
    revenue: mockAppointments.reduce((total, appointment) => total + appointment.total, 0),
    travelFeeRevenue,
    ronRevenue,
    employerVolume: mockAppointments.filter((appointment) => appointment.channel === "employer")
      .length,
    privateVolume: mockAppointments.filter((appointment) => appointment.channel === "private")
      .length,
    averageRevenuePerAppointment:
      mockAppointments.reduce((total, appointment) => total + appointment.total, 0) /
      mockAppointments.length,
    revenuePerMile:
      mockAppointments.reduce((total, appointment) => total + appointment.total, 0) /
      Math.max(
        1,
        mockAppointments.reduce((total, appointment) => total + appointment.travelMiles, 0),
      ),
    topZipCodes,
    reviewConversion:
      mockAppointments.filter((appointment) => appointment.reviewSent).length /
      Math.max(
        1,
        mockAppointments.filter((appointment) => appointment.status === "completed").length,
      ),
    revenueByServiceLine,
  };
}
