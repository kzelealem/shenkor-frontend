// store/useAttendanceStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { AttendanceStatus, NotifiedNote } from "@/types";

type LocalSessionState = {
  title: string;
  date: string;
  sessionNote: string;
  statusMap: Record<string, AttendanceStatus>;
  notesMap: Record<string, NotifiedNote>;
};

type SheetState = {
  open: boolean;
  memberId: string | null;
  tempReason: string;
  tempNote: string;
};

export type SuccessDetails = {
  submissionId: string;
  counts: { present: number; notified: number; absent: number };
};

export type SubmitStatus = "idle" | "submitting" | "error" | "success";

const INITIAL_SESSION_STATE: LocalSessionState = {
  title: `Book of John — Chapter ${new Date().getDate() % 10}`,
  date: new Date().toISOString().slice(0, 10),
  sessionNote: "",
  statusMap: {},
  notesMap: {},
};

type AttendanceStore = {
  // query
  query: string;
  setQuery: (q: string) => void;

  // session
  session: LocalSessionState;
  seedSession: (s: LocalSessionState) => void;
  resetSession: () => void;
  setTitle: (v: string) => void;
  setDate: (v: string) => void;
  setSessionNote: (v: string) => void;
  updateStatus: (memberId: string, status: AttendanceStatus) => void;
  updateNote: (memberId: string, note: NotifiedNote) => void;

  // sheet
  sheet: SheetState;
  openSheetFor: (memberId: string, existing?: NotifiedNote) => void;
  closeSheet: () => void;
  setTempReason: (r: string) => void;
  setTempNote: (n: string) => void;
  saveSheet: () => void;

  // submit (kept for future centralization if you move submit here)
  submitStatus: SubmitStatus;
  submitError: string;
  lastSubmission: SuccessDetails | null;
  setSubmitStatus: (s: SubmitStatus) => void;
  setSubmitError: (e: string) => void;
  setLastSubmission: (d: SuccessDetails | null) => void;
};

export const useAttendanceStore = create<AttendanceStore>()(
  devtools(
    persist(
      (set, get) => ({
        query: "",
        setQuery: (q) => set({ query: q }),

        session: INITIAL_SESSION_STATE,
        seedSession: (s) => set({ session: s }),
        resetSession: () => set({ session: INITIAL_SESSION_STATE }),
        setTitle: (v) => set((st) => ({ session: { ...st.session, title: v } })),
        setDate: (v) => set((st) => ({ session: { ...st.session, date: v } })),
        setSessionNote: (v) =>
          set((st) => ({ session: { ...st.session, sessionNote: v } })),

        updateStatus: (memberId, status) =>
          set((st) => {
            const nextStatus = { ...st.session.statusMap, [memberId]: status };
            const nextNotes =
              status !== "notified"
                ? (() => {
                    const { [memberId]: _drop, ...rest } = st.session.notesMap;
                    return rest;
                  })()
                : st.session.notesMap;
            return {
              session: { ...st.session, statusMap: nextStatus, notesMap: nextNotes },
            };
          }),

        updateNote: (memberId, note) =>
          set((st) => {
            const prevNote = st.session.notesMap[memberId];
            const sameNote =
              prevNote?.reason === note.reason &&
              (prevNote?.note || "") === (note.note || "");
            const sameStatus = st.session.statusMap[memberId] === "notified";
            if (sameNote && sameStatus) return st;
            return {
              session: {
                ...st.session,
                statusMap: { ...st.session.statusMap, [memberId]: "notified" },
                notesMap: { ...st.session.notesMap, [memberId]: note },
              },
            };
          }),

        sheet: { open: false, memberId: null, tempReason: "", tempNote: "" },
        openSheetFor: (memberId, existing) =>
          set((st) => ({
            sheet: {
              open: true,
              memberId,
              tempReason: existing?.reason || "",
              tempNote: existing?.note || "",
            },
          })),
        closeSheet: () => set((st) => ({ sheet: { ...st.sheet, open: false } })),
        setTempReason: (r) => set((st) => ({ sheet: { ...st.sheet, tempReason: r } })),
        setTempNote: (n) => set((st) => ({ sheet: { ...st.sheet, tempNote: n } })),
        saveSheet: () => {
          const { sheet, updateNote, closeSheet } = get();
          if (!sheet.memberId) return;
          updateNote(sheet.memberId, { reason: sheet.tempReason, note: sheet.tempNote });
          closeSheet();
        },

        submitStatus: "idle",
        submitError: "",
        lastSubmission: null,
        setSubmitStatus: (s) => set({ submitStatus: s }),
        setSubmitError: (e) => set({ submitError: e }),
        setLastSubmission: (d) => set({ lastSubmission: d }),
      }),
      {
        name: "attendance-session", // survives reloads
        partialize: (state) => ({
          session: state.session,
          query: state.query,
        }),
        version: 1,
      }
    ),
    { name: "Attendance" }
  )
);
