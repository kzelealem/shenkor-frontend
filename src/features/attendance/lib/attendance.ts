import type { AttendanceStatus, Member } from "@/types";
import type { Counts } from "../types";

export type SearchableMember = Member & {
  __lcName: string;
  __lcPhone: string;
};

export function decorateMembersForSearch(members: Member[]): SearchableMember[] {
  return members.map((m) => ({
    ...m,
    __lcName: (m.name || "").toLowerCase(),
    __lcPhone: (m.phone || "").toLowerCase(),
  }));
}

export function filterMembers<T extends { __lcName?: string; __lcPhone?: string; name?: string; phone?: string }>(
  members: T[],
  q: string
): T[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return members;
  return members.filter((m) => {
    const n = (m.__lcName ?? (m.name || "").toLowerCase());
    const p = (m.__lcPhone ?? (m.phone || "").toLowerCase());
    return n.includes(needle) || p.includes(needle);
  });
}

export function computeCounts(statusMap: Record<string, AttendanceStatus>, total: number): Counts {
  const s = Object.values(statusMap);
  const present = s.filter((x) => x === "present").length;
  const notified = s.filter((x) => x === "notified").length;
  const absent = s.filter((x) => x === "absent").length;
  return { present, notified, absent, marked: present + notified + absent, total };
}
