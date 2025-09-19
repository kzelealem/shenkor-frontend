import type { Member } from "@/types";
import type { DashboardData, DetailedAttendanceRecord } from "@/types";
import { api } from "./http";

/**
 * Fetches all data needed to render the HLG Coordinator dashboard.
 * GET /api/me/dashboard
 */
export async function fetchDashboardData() {
  return api.get<DashboardData>("/me/dashboard");
}

/**
 * Fetches the full details of a specific, past attendance submission.
 * GET /api/attendances/:id
 */
export async function fetchAttendanceRecord(id: string) {
  return api.get<DetailedAttendanceRecord>(`/attendances/${id}`);
}
