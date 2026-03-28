import { describe, expect, it } from "vitest";

import { canBookService, getLaunchMilestones, getReadinessSummary } from "./launch";

const baseProfile = {
  legalName: "Test Notary",
  commissionNumber: "OH-TEST-1",
  commissionIssueDate: "2026-02-10",
  commissionExpirationDate: "2031-02-10",
  commissionApprovedDate: "2026-02-08",
  ronAuthorized: true,
  ronIssueDate: "2026-03-05",
  ronExpirationDate: "2031-02-10",
  oathCompleted: true,
  bciDate: "2025-12-18",
  sealOrdered: true,
  sealReceivedDate: "2026-02-12",
  journalTypeConfigured: "hybrid",
  eSignatureConfigured: true,
  eSealConfigured: true,
  ronPlatformConfigured: true,
  initialEducationCompleted: true,
  ronEducationCompleted: true,
  initialApplicationFiled: true,
  ronApplicationFiled: true,
  llcFormed: true,
  llcFormedDate: "2026-03-01",
  einObtainedDate: "2026-03-03",
  businessBankingReady: true,
  eoInsuranceActive: true,
  eoInsuranceRenewalDate: "2027-03-03",
  googleBusinessProfileLive: true,
  websiteLive: true,
  employerPrivateSeparationConfirmed: true,
  intakeWorkflowReady: true,
  pricingPolicyReady: true,
  travelZonePolicyReady: true,
  recordingStorageConfigured: true,
} as const;

describe("launch readiness", () => {
  it("keeps commission inactive if oath is incomplete", () => {
    const readiness = getReadinessSummary({ ...baseProfile, oathCompleted: false });
    expect(readiness.commissionActive).toBe(false);
    expect(readiness.permissionMatrix.canBookInPerson).toBe(false);
  });

  it("keeps commission inactive if seal is not ordered", () => {
    const readiness = getReadinessSummary({ ...baseProfile, sealOrdered: false });
    expect(readiness.commissionActive).toBe(false);
  });

  it("allows in-person only when RON authorization stack is incomplete", () => {
    const readiness = getReadinessSummary({ ...baseProfile, ronApplicationFiled: false });
    expect(readiness.commissionActive).toBe(true);
    expect(readiness.ronActive).toBe(false);
    expect(readiness.currentAllowedServiceModes).toBe("IN_PERSON_ONLY");
  });

  it("blocks RON when e-seal or platform readiness is missing", () => {
    const readiness = getReadinessSummary({ ...baseProfile, eSealConfigured: false });
    expect(readiness.ronActive).toBe(false);
    expect(readiness.permissionMatrix.canBookRON).toBe(false);
  });
});

describe("launch milestones", () => {
  it("locks dependent manual milestones when prerequisites are missing", () => {
    const milestones = getLaunchMilestones({ ...baseProfile, ronPlatformConfigured: false });
    const recordingStorageMilestone = milestones.find(
      (milestone) => milestone.code === "recording_storage_configured",
    );
    expect(recordingStorageMilestone?.status).toBe("LOCKED");
  });

  it("marks derived commission milestone complete when readiness gates pass", () => {
    const milestones = getLaunchMilestones(baseProfile);
    const commissionActiveMilestone = milestones.find((milestone) => milestone.code === "commission_active");
    expect(commissionActiveMilestone?.status).toBe("COMPLETED");
  });
});

describe("service gating", () => {
  it("returns in-person booking permission from readiness gates", () => {
    const permission = canBookService("in_person");
    expect(permission.ok).toBe(true);
  });
});
