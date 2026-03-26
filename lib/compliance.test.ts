import { describe, expect, it } from "vitest";

import { validateAppointmentCompliance } from "./compliance";

describe("validateAppointmentCompliance", () => {
  it("blocks incomplete vehicle title work", () => {
    const result = validateAppointmentCompliance({
      appointmentDate: "2026-03-30",
      commissionStartDate: "2026-03-01",
      appearanceType: "in_person",
      serviceType: "auto_title",
      signerPresent: true,
      documentComplete: true,
      hasNotarialCertificate: true,
      certificate: {
        venueState: "Ohio",
        venueCounty: "Franklin",
        notarizedAt: "2026-03-30",
        commissionExpirationDate: "2031-03-01",
        sealApplied: true,
      },
      titleFieldsComplete: false,
      idDocumentType: "drivers_license",
      idExpirationDate: "2027-10-01",
      idCaptureMethod: "government_id",
      signerMentallyCapable: true,
    });

    expect(result.ok).toBe(false);
    expect(result.blockingIssues.some((issue) => issue.code === "title_blank_fields")).toBe(true);
  });

  it("blocks RON completion without electronic journal creation", () => {
    const result = validateAppointmentCompliance({
      appointmentDate: "2026-03-30",
      commissionStartDate: "2026-03-01",
      appearanceType: "ron",
      serviceType: "affidavit",
      signerPresent: true,
      documentComplete: true,
      hasNotarialCertificate: true,
      certificate: {
        venueState: "Ohio",
        venueCounty: "Franklin",
        notarizedAt: "2026-03-30",
        commissionExpirationDate: "2031-03-01",
        sealApplied: true,
      },
      idDocumentType: "passport",
      idExpirationDate: "2028-08-01",
      idCaptureMethod: "credential_analysis",
      signerMentallyCapable: true,
      ronAuthorized: true,
      credentialAnalysisPassed: true,
      identityProofingPassed: true,
      electronicJournalCreated: false,
    });

    expect(result.ok).toBe(false);
    expect(result.blockingIssues.some((issue) => issue.code === "electronic_journal_missing")).toBe(true);
  });
});
