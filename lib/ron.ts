export interface StartRonSessionInput {
  appointmentId: string;
  clientName: string;
  ronAuthorized: boolean;
  platformName: string;
  sessionUrl: string;
}

export interface CompleteRonSessionInput {
  appointmentId: string;
  credentialAnalysisPassed: boolean;
  identityProofingPassed: boolean;
  audioVideoVerified: boolean;
  recordingSaved: boolean;
  journalCompleted: boolean;
  techFeeCharged: number;
}

export function startRonSession(input: StartRonSessionInput) {
  const blockers = input.ronAuthorized ? [] : ["RON authorization is not active."];

  return {
    appointmentId: input.appointmentId,
    clientName: input.clientName,
    sessionStatus: blockers.length === 0 ? "active" : "blocked",
    blockers,
    checklist: [
      "Notary is physically located in Ohio.",
      "Two-way live audio-video connection verified.",
      "Credential analysis and identity proofing ready.",
    ],
    platformName: input.platformName,
    sessionUrl: input.sessionUrl,
  };
}

export function completeRonSession(input: CompleteRonSessionInput) {
  const blockers: string[] = [];

  if (!input.audioVideoVerified) {
    blockers.push("Audio-video connection was not verified.");
  }

  if (!input.credentialAnalysisPassed) {
    blockers.push("Credential analysis must pass before completion.");
  }

  if (!input.identityProofingPassed) {
    blockers.push("Identity proofing must pass before completion.");
  }

  if (!input.recordingSaved) {
    blockers.push("Recording reference must be stored.");
  }

  if (!input.journalCompleted) {
    blockers.push("Electronic journal entry must be completed.");
  }

  if (input.techFeeCharged > 10) {
    blockers.push("RON tech fee exceeds the Ohio $10 per-session cap.");
  }

  return {
    appointmentId: input.appointmentId,
    sessionStatus: blockers.length === 0 ? "completed" : "blocked",
    blockers,
  };
}
