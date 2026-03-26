export interface MockUploadInput {
  appointmentId: string;
  uploadedByPortalUserId: string;
  fileName: string;
  mimeType: string;
}

export function createMockUpload(input: MockUploadInput) {
  return {
    id: `upload_${Date.now()}`,
    appointmentId: input.appointmentId,
    uploadedByPortalUserId: input.uploadedByPortalUserId,
    fileName: input.fileName,
    mimeType: input.mimeType,
    storagePath: `mock/uploads/${input.fileName}`,
    signedUploadUrl: `https://uploads.local/${encodeURIComponent(input.fileName)}`,
    reviewed: false,
    flagged: false,
    createdAt: new Date().toISOString(),
  };
}
