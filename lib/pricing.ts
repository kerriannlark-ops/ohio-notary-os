import {
  OHIO_FEE_LIMITS,
  ServiceType,
  SpecialLocationType,
  getMaximumActFee,
  isUnsupportedServiceType,
} from "./ohioRules";
import {
  DEFAULT_AFTER_HOURS_SURCHARGE,
  TravelQuote,
  calculateTravelFeeByMiles,
} from "./travel";

export interface QuoteInput {
  actType: ServiceType;
  actCount: number;
  isRON: boolean;
  ronAuthorized?: boolean;
  travelMiles?: number;
  travelFeeAccepted?: boolean;
  isAfterHours?: boolean;
  specialLocationType?: SpecialLocationType;
  techFeeRequested?: number;
  afterHoursSurcharge?: number;
}

export interface QuoteLineItem {
  code: string;
  label: string;
  amount: number;
  quantity?: number;
}

export interface QuoteResult {
  isValid: boolean;
  subtotal: number;
  total: number;
  lineItems: QuoteLineItem[];
  complianceErrors: string[];
  warnings: string[];
  travel?: TravelQuote;
}

export function createOhioQuote(input: QuoteInput): QuoteResult {
  const lineItems: QuoteLineItem[] = [];
  const complianceErrors: string[] = [];
  const warnings: string[] = [];
  const actCount = Math.max(0, input.actCount);
  const actFeeLimit = getMaximumActFee(input.isRON);
  const notarialFee = actCount * actFeeLimit;

  if (!Number.isInteger(input.actCount) || input.actCount <= 0) {
    complianceErrors.push("Act count must be a positive whole number.");
  }

  if (isUnsupportedServiceType(input.actType)) {
    complianceErrors.push(
      "Ohio Notary OS blocks copy certification requests because they are not supported in Ohio.",
    );
  }

  if (input.isRON && !input.ronAuthorized) {
    complianceErrors.push("RON booking requested before online authorization is active.");
  }

  lineItems.push({
    code: "notarial_fee",
    label: input.isRON ? "Ohio online notarization fee" : "Ohio in-person notarial fee",
    amount: notarialFee,
    quantity: actCount,
  });

  if (input.isRON) {
    const techFee = input.techFeeRequested ?? 0;

    if (techFee > OHIO_FEE_LIMITS.ronTechnologyFeeMax) {
      complianceErrors.push(
        `RON technology fee exceeds Ohio's $${OHIO_FEE_LIMITS.ronTechnologyFeeMax} per-session limit.`,
      );
    }

    if (techFee > 0) {
      lineItems.push({
        code: "ron_tech_fee",
        label: "RON technology fee",
        amount: techFee,
      });
    }
  } else if ((input.travelMiles ?? 0) > 0) {
    if (!input.travelFeeAccepted) {
      complianceErrors.push(
        "Travel fee cannot be charged unless it was separately disclosed and accepted in advance.",
      );
    } else {
      const travel = calculateTravelFeeByMiles(
        input.travelMiles ?? 0,
        input.specialLocationType ?? "standard",
      );

      lineItems.push({
        code: "travel_fee",
        label: `Travel fee - ${travel.zone.label}`,
        amount: travel.totalTravelFee,
      });
    }
  }

  if (input.isAfterHours) {
    const afterHoursSurcharge =
      input.afterHoursSurcharge ?? DEFAULT_AFTER_HOURS_SURCHARGE;

    lineItems.push({
      code: "after_hours",
      label: "After-hours convenience surcharge",
      amount: afterHoursSurcharge,
    });
  }

  if (!input.isRON && input.travelMiles === undefined) {
    warnings.push(
      "No travel mileage supplied. The quote excludes any separately disclosed mobile travel fee.",
    );
  }

  if (input.actType === "loan_signing") {
    warnings.push(
      "Loan-signing support can include non-notarial service work. Keep notarial fees and non-notarial package fees clearly itemized.",
    );
  }

  const subtotal = sumLineItems(lineItems);
  const total = subtotal;
  const travel =
    !input.isRON && (input.travelMiles ?? 0) > 0 && input.travelFeeAccepted
      ? calculateTravelFeeByMiles(
          input.travelMiles ?? 0,
          input.specialLocationType ?? "standard",
        )
      : undefined;

  return {
    isValid: complianceErrors.length === 0,
    subtotal,
    total,
    lineItems,
    complianceErrors,
    warnings,
    travel,
  };
}

function sumLineItems(lineItems: QuoteLineItem[]): number {
  return lineItems.reduce((total, item) => total + item.amount, 0);
}
