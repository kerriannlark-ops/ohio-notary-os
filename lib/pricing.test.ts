import { describe, expect, it } from "vitest";

import { createOhioQuote } from "./pricing";

describe("createOhioQuote", () => {
  it("caps in-person act fees at the Ohio statutory amount", () => {
    const result = createOhioQuote({
      actType: "general_notary",
      actCount: 3,
      isRON: false,
      travelMiles: 0,
    });

    expect(result.total).toBe(15);
    expect(result.complianceErrors).toHaveLength(0);
  });

  it("blocks copy certification", () => {
    const result = createOhioQuote({
      actType: "copy_certification",
      actCount: 1,
      isRON: false,
      travelMiles: 0,
    });

    expect(result.isValid).toBe(false);
    expect(result.complianceErrors[0]).toContain("copy certification");
  });

  it("rejects excessive RON technology fees", () => {
    const result = createOhioQuote({
      actType: "affidavit",
      actCount: 1,
      isRON: true,
      ronAuthorized: true,
      techFeeRequested: 11,
    });

    expect(result.isValid).toBe(false);
    expect(result.complianceErrors[0]).toContain("$10");
  });
});
