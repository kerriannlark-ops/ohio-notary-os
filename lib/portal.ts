import {
  documentUploads,
  portalAppointments,
  portalChecklistItems,
  portalDisclosures,
  portalInvoices,
  portalMessages,
} from "./mockData";

export function getPortalDashboard() {
  const nextAppointment = portalAppointments.find(
    (appointment) =>
      appointment.portalStatus !== "closed" &&
      appointment.portalStatus !== "completed" &&
      appointment.portalStatus !== "could_not_complete",
  );

  return {
    nextAppointment,
    paymentDue: portalInvoices
      .filter((invoice) => invoice.status === "due")
      .reduce((total, invoice) => total + invoice.total, 0),
    uploadedDocumentCount: documentUploads.length,
    unreadMessages: portalMessages.filter((message) => !message.readAt).length,
    missingItems: portalAppointments.flatMap((appointment) => appointment.missingItems).length,
  };
}

export function getPortalAppointments() {
  return portalAppointments;
}

export function getPortalInvoices() {
  return portalInvoices;
}

export function getPortalMessages() {
  return portalMessages;
}

export function getPortalDocuments() {
  return documentUploads;
}

export function getPortalChecklist() {
  return portalChecklistItems;
}

export function getPortalDisclosures() {
  return portalDisclosures;
}

export function createPortalMessage(body: string, appointmentId: string) {
  return {
    id: `msg-${portalMessages.length + 1}`.padStart(7, "0"),
    appointmentId,
    senderType: "client",
    messageType: "appointment_follow_up",
    body,
    createdAt: new Date().toISOString(),
  };
}
