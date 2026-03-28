import { PrismaClient } from "@prisma/client";

import { mockAppointments } from "../lib/mockData";

const prisma = new PrismaClient();
const prismaAny = prisma as any;

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "owner@ohionotaryos.local" },
    update: {},
    create: {
      email: "owner@ohionotaryos.local",
      role: "OWNER",
      profile: {
        create: {
          legalName: "Kerri Ann Lark",
          commissionNumber: "OH-2026-0001",
          commissionIssueDate: new Date("2026-03-01"),
          commissionExpirationDate: new Date("2031-03-01"),
          commissionApprovedDate: new Date("2026-02-26"),
          ronAuthorized: true,
          ronIssueDate: new Date("2026-03-10"),
          ronExpirationDate: new Date("2031-03-01"),
          oathCompleted: true,
          bciDate: new Date("2026-02-15"),
          baseCity: "Columbus",
          baseCounty: "Franklin",
          businessModeEnabled: true,
          employerModeEnabled: true,
          businessEntityType: "LLC",
          businessEntityName: "Ohio Notary OS LLC",
          einStatus: true,
          sealOrdered: true,
          sealReceivedDate: new Date("2026-03-02"),
          journalTypeConfigured: "hybrid",
          eSealConfigured: true,
          eSignatureConfigured: true,
          ronPlatformConfigured: true,
          initialEducationCompleted: true,
          ronEducationCompleted: true,
          initialApplicationFiled: true,
          ronApplicationFiled: true,
          llcFormed: true,
          llcFormedDate: new Date("2026-03-04"),
          einObtainedDate: new Date("2026-03-05"),
          businessBankingReady: true,
          eoInsuranceActive: true,
          eoInsuranceRenewalDate: new Date("2027-03-10"),
          googleBusinessProfileLive: true,
          websiteLive: true,
          employerPrivateSeparationConfirmed: true,
        } as any,
      },
    },
    include: { profile: true },
  });

  await Promise.all(
    [
      {
        code: "local",
        label: "Columbus core (0-10 miles)",
        minMiles: 0,
        maxMiles: 10,
        baseFee: 30,
        zipCodes: ["43215", "43201", "43212", "43220"],
      },
      {
        code: "metro",
        label: "Franklin County metro (10-20 miles)",
        minMiles: 10.01,
        maxMiles: 20,
        baseFee: 35,
        zipCodes: ["43224", "43229", "43235", "43123"],
      },
      {
        code: "extended",
        label: "Extended service area (20-30 miles)",
        minMiles: 20.01,
        maxMiles: 30,
        baseFee: 50,
        zipCodes: ["43004", "43017", "43085"],
      },
      {
        code: "custom",
        label: "Custom quote (30+ miles)",
        minMiles: 30.01,
        maxMiles: null,
        baseFee: 65,
        zipCodes: [],
      },
    ].map((zone) =>
      prisma.travelZone.upsert({
        where: { code: zone.code },
        update: zone,
        create: zone,
      }),
    ),
  );

  for (const appointment of mockAppointments) {
    const client = await prisma.client.upsert({
      where: {
        email: `${appointment.id}@example.com`,
      },
      update: {
        name: appointment.clientName,
      },
      create: {
        type: appointment.channel === "employer" ? "EMPLOYER" : "INDIVIDUAL",
        name: appointment.clientName,
        email: `${appointment.id}@example.com`,
        phone: "614-555-0100",
        preferredContactMethod: "SMS",
        referralSource:
          appointment.channel === "employer" ? "Employer queue" : "Google Business Profile",
      },
    });

    const createdAppointment = await prisma.appointment.upsert({
      where: { id: appointment.id },
      update: {
        status: mapStatus(appointment.status),
        travelMiles: appointment.travelMiles,
        afterHours: appointment.afterHours,
      },
      create: {
        id: appointment.id,
        clientId: client.id,
        channel: appointment.channel === "employer" ? "EMPLOYER" : "PRIVATE",
        serviceMode: mapMode(appointment.serviceMode),
        serviceType: appointment.serviceType,
        documentType: appointment.serviceType.replaceAll("_", " "),
        facilityType: mapFacility(appointment.facilityType),
        status: mapStatus(appointment.status),
        requestedAt: new Date(appointment.scheduledStart),
        scheduledStart: new Date(appointment.scheduledStart),
        scheduledEnd: new Date(new Date(appointment.scheduledStart).getTime() + 45 * 60 * 1000),
        city: "Columbus",
        state: "OH",
        zip: appointment.zip === "online" ? null : appointment.zip,
        travelMiles: appointment.travelMiles,
        urgentLevel: appointment.afterHours ? "after_hours" : "standard",
        afterHours: appointment.afterHours,
        specialInstructions: appointment.blockedReason,
        complianceStatus: appointment.blocked ? "blocked" : "ready",
        refusalReason: appointment.blockedReason,
      },
    });

    await prisma.quote.upsert({
      where: { appointmentId: createdAppointment.id },
      update: {
        total: appointment.total,
        blocked: appointment.blocked,
        blockReason: appointment.blockedReason,
      },
      create: {
        appointmentId: createdAppointment.id,
        traditionalActFee: appointment.serviceMode === "ron" ? 0 : appointment.actCount * 5,
        ronActFee: appointment.serviceMode === "ron" ? appointment.actCount * 30 : 0,
        technologyFee: appointment.serviceMode === "ron" ? 10 : 0,
        travelFee: appointment.serviceMode === "ron" ? 0 : appointment.travelMiles > 0 ? appointment.total - appointment.actCount * 5 : 0,
        total: appointment.total,
        travelFeeDisclosed: appointment.travelMiles > 0,
        travelFeeAccepted: appointment.travelMiles > 0,
        blocked: appointment.blocked,
        blockReason: appointment.blockedReason,
      },
    });
  }

  await prismaAny.goal.upsert({
    where: { id: "goal-mar-2026" },
    update: {},
    create: {
      id: "goal-mar-2026",
      periodType: "MONTH",
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-31"),
      revenueTarget: 2500,
      appointmentTarget: 24,
      ronTarget: 6,
      mobileTarget: 14,
      reviewTarget: 8,
      b2bOutreachTarget: 12,
    },
  });

  console.log(`Seeded owner ${owner.email} with ${mockAppointments.length} appointments.`);
}

function mapMode(mode: string): any {
  if (mode === "ron") {
    return "RON";
  }

  if (mode === "electronic_in_person") {
    return "ELECTRONIC_IN_PERSON";
  }

  return "IN_PERSON";
}

function mapStatus(status: string): any {
  switch (status) {
    case "awaiting_documents":
      return "AWAITING_DOCUMENTS";
    case "awaiting_id_confirmation":
      return "AWAITING_ID_CONFIRMATION";
    case "en_route":
      return "EN_ROUTE";
    case "signer_not_ready":
      return "SIGNER_NOT_READY";
    case "no_show":
      return "NO_SHOW";
    case "follow_up_needed":
      return "FOLLOW_UP_NEEDED";
    default:
      return status.toUpperCase();
  }
}

function mapFacility(facility: string): any {
  switch (facility) {
    case "title_auto":
      return "TITLE_AUTO";
    case "jail_detention":
      return "JAIL_DETENTION";
    case "employer_internal":
      return "EMPLOYER_INTERNAL";
    case "online":
      return "ONLINE";
    default:
      return facility.toUpperCase();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
