import type { MemberAttendanceReport } from "@/types";
import { api } from "./http";

/**
 * Fetches the full attendance report for a specific member.
 * GET /api/members/:id/attendance
 */
export async function fetchMemberAttendance(memberId: string) {
  return api.get<MemberAttendanceReport>(`/members/${memberId}/attendance`);
}