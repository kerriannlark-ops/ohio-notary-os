import { createHash } from "crypto";

export interface JournalDraftInput {
  appointmentId: string;
  clientName: string;
  mode: "traditional" | "ron";
  actType: string;
  documentTitle: string;
  principalName: string;
  idMethod: string;
  recordingReference?: string;
  platformName?: string;
  notaryNotes?: string;
}

export function createJournalEntryDraft(input: JournalDraftInput) {
  const entryDataJson = {
    appointmentId: input.appointmentId,
    clientName: input.clientName,
    mode: input.mode,
    actType: input.actType,
    documentTitle: input.documentTitle,
    principalName: input.principalName,
    idMethod: input.idMethod,
    recordingReference: input.recordingReference ?? null,
    platformName: input.platformName ?? null,
    notaryNotes: input.notaryNotes ?? "",
    createdAt: new Date().toISOString(),
  };

  return {
    mode: input.mode,
    entryDataJson,
    tamperHash: createHash("sha256")
      .update(JSON.stringify(entryDataJson))
      .digest("hex"),
    chronologicalIndex: Date.now(),
  };
}
