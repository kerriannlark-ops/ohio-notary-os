import { mockAppointments } from "./mockData";

export function buildRevenueCsv(): string {
  return toCsv(
    ["appointmentId", "clientName", "channel", "serviceMode", "serviceType", "status", "total"],
    mockAppointments.map((appointment) => [
      appointment.id,
      appointment.clientName,
      appointment.channel,
      appointment.serviceMode,
      appointment.serviceType,
      appointment.status,
      String(appointment.total),
    ]),
  );
}

export function buildMileageCsv(): string {
  return toCsv(
    ["appointmentId", "clientName", "zip", "travelMiles", "afterHours"],
    mockAppointments
      .filter((appointment) => appointment.travelMiles > 0)
      .map((appointment) => [
        appointment.id,
        appointment.clientName,
        appointment.zip,
        String(appointment.travelMiles),
        String(appointment.afterHours),
      ]),
  );
}

export function buildJournalCsv(): string {
  return toCsv(
    ["appointmentId", "clientName", "mode", "serviceType", "scheduledStart", "status"],
    mockAppointments
      .filter(
        (appointment) =>
          appointment.status === "completed" || appointment.serviceMode === "ron",
      )
      .map((appointment) => [
        appointment.id,
        appointment.clientName,
        appointment.serviceMode === "ron" ? "ron" : "traditional",
        appointment.serviceType,
        appointment.scheduledStart,
        appointment.status,
      ]),
  );
}

function toCsv(headers: string[], rows: string[][]): string {
  const encodedRows = rows.map((row) =>
    row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","),
  );

  return [headers.join(","), ...encodedRows].join("\n");
}
