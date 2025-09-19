// src/types.ts

// --- Core Data Models ---
export type Member = {
  id: string;
  name: string; // backward-compatible display name
  phone: string;
  // New rich fields
  firstName?: string;
  middleName?: string;
  lastName?: string;
  batchNumber?: number; // culture class batch
  telegramUsername?: string; // without '@'
  photoUrl?: string;
};

// --- Attendance-Specific Types ---
export type AttendanceStatus = "unmarked" | "present" | "notified" | "absent";

export type NotifiedNote = { reason?: string; note?: string };

/**
 * The full payload sent when submitting a new attendance record.
 */
export type SubmissionPayload = {
  title: string;
  date: string;
  sessionNote: string;
  photoUrls: string[];
  statusMap: Record<string, AttendanceStatus>;
  notesMap: Record<string, NotifiedNote>;
};

// --- Dashboard-Specific Types ---

/**
 * A summary of a previously submitted attendance record for list views.
 */
export interface AttendanceRecordSummary {
  id: string;
  date: string; // "YYYY-MM-DD" format
  counts: {
    present: number;
    notified: number;
    absent: number;
    total: number;
  };
}

/**
 * A detailed view of a single, past attendance record.
 * It combines the submission data with server-generated metadata.
 */
export type DetailedAttendanceRecord = SubmissionPayload & {
  id: string;
  hlgId: string;
  submittedAt: string; // ISO string
};

/**
 * The complete data structure for the HLG Coordinator's dashboard.
 */
export interface DashboardData {
  hlg: {
    id: string;
    name: string;
  };
  zone: {
    id: string;
    name: string;
  };
  currentWeekAttendance: AttendanceRecordSummary | null;
  insights: {
    totalMembers: number;
    averageAttendancePercentage: number;
    followUpCount: number;
  };
  membersToFollowUp: (Member & { lastSeen: string })[];
  recentSubmissions: AttendanceRecordSummary[];
  extras?: DashboardExtras;
}

export type DashboardExtras = {
  coordinator?: { id: string; name: string; phone: string; email?: string };
  hlgMeta?: {
    schedule: { weekday: number; cadence: "weekly" | "biweekly"; time: string };
    location?: string;
    nextMeetingDate?: string; // ISO
  };
  zoneMeta?: { hlgCount: number; averageAttendancePercentage: number; rankInDistrict?: number; districtName?: string };
  health?: { missingContacts: number; dataCompletenessPercent: number; policyCompliance: { submissionsThisMonth: number; minRequired: number } };
  submissionStreak?: number;
  recentActivity?: Array<{ id: string; date: string; submittedAt: string; submittedBy: string; photoCount?: number; sessionNoteExcerpt?: string }>;
};


// --- NEW: Member-Specific Report Types ---

/**
 * Summary statistics for a single member's attendance.
 */
export type MemberAttendanceSummary = {
  totalMeetings: number;
  presentCount: number;
  notifiedCount: number;
  absentCount: number;
  attendancePercentage: number;
};

/**
 * A single entry in a member's attendance history.
 */
export type MemberAttendanceHistoryItem = {
  date: string; // "YYYY-MM-DD"
  title: string;
  status: AttendanceStatus;
};

/**
 * The complete attendance report for a single member.
 */
export interface MemberAttendanceReport {
  summary: MemberAttendanceSummary;
  history: MemberAttendanceHistoryItem[];
}