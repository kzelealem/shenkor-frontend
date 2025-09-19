// api/attendance.ts
import type { AttendanceStatus, Member, NotifiedNote } from "@/types";
import type { SubmissionPayload } from "@/types";
import { api, uploadFile } from "./http";

export async function fetchMyHlgDetails() {
  return api.get<{
    hlg: { id: string; name: string };
    zone: { id: string; name: string };
    members: Member[];
  }>("/me/hlg");
}

/** STEP 1: Ask our server for secure, pre-signed upload URLs for MULTIPLE files. */
export async function preparePhotoUploads(fileNames: string[]) {
  return api.post<{ uploads: { presignedUrl: string; finalObjectUrl: string }[] }>(
    "/uploads/prepare",
    { fileNames }
  );
}

/** STEP 2: Upload a single file to MinIO/S3 via its presigned URL. Supports cancellation. */
export async function uploadPhotoToMinio(
  url: string,
  file: File,
  signal?: AbortSignal
) {
  return uploadFile(url, file, signal);
}

/** STEP 3: Submit the final record, now with an array of photo URLs. */
export async function submitHlgAttendance(hlgId: string, payload: SubmissionPayload) {
  return api.post<{
    ok: true;
    submissionId: string;
    counts: { present: number; notified: number; absent: number; total: number };
  }>(`/hlgs/${hlgId}/attendances`, payload);
}

export async function updateHlgAttendance(submissionId: string, payload: SubmissionPayload) {
  return api.put<{
    ok: true;
    submissionId: string;
    counts: { present: number; notified: number; absent: number; total: number };
  }>(`/attendances/${submissionId}`, payload);
}
