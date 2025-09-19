// attendance/AttendancePage.tsx
import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useDeferredValue,
  useTransition,
} from "react";
import type { AttendanceStatus, Member, SubmissionPayload } from "@/types";
import type { Page } from "@/App";
import { useTranslation } from "react-i18next";
import { vibrate } from "@/lib/a11y";

import {
  fetchMyHlgDetails,
  submitHlgAttendance,
  updateHlgAttendance,
} from "@/api/attendance";
import { fetchAttendanceRecord } from "@/api/dashboard";

import { AttendanceHeader } from "./components/AttendanceHeader";
import { MembersList } from "./MembersList";
import { SessionCard } from "./components/SessionCard";
import { MultiPhotoUpload } from "@/components/MultiPhotoUpload";
import { SubmitBar } from "./SubmitBar";
import { NotifiedSheet } from "./NotifiedSheet";
import { SummaryModal } from "./SummaryModal";
import { SuccessScreen } from "./SuccessScreen";

import { usePhotoUploads } from "./hooks/usePhotoUploads";
import {
  computeCounts,
  filterMembers,
  decorateMembersForSearch,
} from "./lib/attendance";
import type { Counts, SubmitStatus } from "./types";

import { useAttendanceStore } from "./store/useAttendanceStore";
import { useShallow } from "zustand/react/shallow";

type HlgInfo = { id: string; name: string };
type ZoneInfo = { id: string; name: string };

type SuccessDetails = {
  submissionId: string;
  counts: { present: number; notified: number; absent: number };
};

export default function AttendancePage({
  onNavigate,
  submissionId,
}: {
  onNavigate: (page: Page) => void;
  submissionId: string | null;
}) {
  const { t } = useTranslation(["attendance", "common"]);

  // org/session metadata from API
  const [hlg, setHlg] = useState<HlgInfo | null>(null);
  const [zone, setZone] = useState<ZoneInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Zustand — group selectors with shallow to reduce re-renders
  const {
    session,
    seedSession,
    resetSession,
    setTitle,
    setDate,
    setSessionNote,
    updateStatus: updateStatusInStore,
    openSheetFor: openSheetForStore,
    query,
    setQuery,
  } = useAttendanceStore(
    useShallow((s) => ({
      session: s.session,
      seedSession: s.seedSession,
      resetSession: s.resetSession,
      setTitle: s.setTitle,
      setDate: s.setDate,
      setSessionNote: s.setSessionNote,
      updateStatus: s.updateStatus,
      openSheetFor: s.openSheetFor,
      query: s.query,
      setQuery: s.setQuery,
    }))
  );

  // Local UI state
  const [showSummary, setShowSummary] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string>("");
  const [lastSubmission, setLastSubmission] = useState<SuccessDetails | null>(
    null
  );

  const [, startTransition] = useTransition();

  // Uploads
  const {
    uploads: photoUploads,
    addFiles: handleFilesChange,
    removeById: handleRemovePhoto,
    resetAll: resetPhotos,
    uploading: photosUploading,
    seedFromUrls,
  } = usePhotoUploads({ maxFiles: 12, maxSizeMB: 8 });

  // Hydrate (new vs edit)
  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      try {
        const { hlg, zone, members } = await fetchMyHlgDetails();
        if (!alive) return;

        setHlg(hlg);
        setZone(zone);
        setMembers(decorateMembersForSearch(members));

        if (submissionId) {
          const record = await fetchAttendanceRecord(submissionId);
          if (!alive) return;

          // seed session first so fields populate immediately
          seedSession({
            title: record.title,
            date: record.date,
            sessionNote: record.sessionNote,
            statusMap: record.statusMap,
            notesMap: record.notesMap,
          });

          if (record.photoUrls?.length) {
            seedFromUrls(record.photoUrls);
          }
        } else {
          resetSession();
          resetPhotos();
        }
      } catch (e) {
        console.error(e);
        alert(t("attendance:pageTitle.loadingError"));
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [submissionId, t, resetPhotos, seedFromUrls, seedSession, resetSession]);

  // Derived lists
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(
    () => filterMembers(members, deferredQuery),
    [members, deferredQuery]
  );
  const counts: Counts = useMemo(
    () => computeCounts(session.statusMap, members.length),
    [session.statusMap, members.length]
  );

  // Actions
  const updateStatus = useCallback(
    (memberId: string, status: AttendanceStatus) => {
      startTransition(() => updateStatusInStore(memberId, status));
      vibrate(8);
    },
    [updateStatusInStore]
  );

  const openSheetFor = useCallback(
    (memberId: string) => {
      const existing = session.notesMap[memberId];
      openSheetForStore(memberId, existing);
    },
    [session.notesMap, openSheetForStore]
  );

  // Submission
  const confirmSubmit = useCallback(async () => {
    if (!hlg || submitStatus === "submitting") return;
    if (photosUploading) {
      alert(t("attendance:alerts.photosUploading"));
      return;
    }

    setSubmitError("");
    setSubmitStatus("submitting");

    try {
      const finalPhotoUrls: string[] = photoUploads
        .filter((p) => p.status === "done" && typeof p.finalUrl === "string")
        .map((p) => p.finalUrl as string);

      const payload: SubmissionPayload = {
        title: session.title,
        date: session.date,
        sessionNote: session.sessionNote,
        statusMap: session.statusMap,
        notesMap: session.notesMap,
        photoUrls: finalPhotoUrls,
      };

      const isEditing = !!submissionId;
      const res = isEditing
        ? await updateHlgAttendance(submissionId, payload)
        : await submitHlgAttendance(hlg.id, payload);

      setLastSubmission(res);
      setSubmitStatus("success");
      setShowSummary(false);

      if (!isEditing) {
        resetSession();
        // resetPhotos(); // enable if you want to clear uploads after submit
      }
    } catch (e: unknown) {
      console.error(e);
      const message =
        e instanceof Error ? e.message : t("attendance:alerts.unknownError");
      setSubmitStatus("error");
      setSubmitError(message);
    }
  }, [
    hlg,
    session,
    submissionId,
    photosUploading,
    t,
    submitStatus,
    photoUploads,
    resetSession,
  ]);

  // UI bits
  const unmarkedCount = useMemo(
    () => members.length - counts.marked,
    [members.length, counts.marked]
  );
  const isEditing = !!submissionId;

  // Routes
  if (submitStatus === "success" && lastSubmission) {
    return (
      <SuccessScreen
        details={lastSubmission}
        onNavigate={onNavigate}
        isUpdate={isEditing}
      />
    );
  }

  if (isLoading) {
    return <div className="p-10 text-center text-lg">{t("common:loading")}</div>;
  }

  return (
    <div className="w-full min-h-screen">
      <AttendanceHeader
        heading={t("attendance:pageTitle.heading", { zoneName: zone?.name ?? "" })}
        title={t("attendance:pageTitle.title", { hlgName: hlg?.name ?? "" })}
        badge={t("attendance:pageTitle.badge", {
          marked: counts.marked,
          total: counts.total,
        })}
        counts={counts}
        unmarkedCount={unmarkedCount}
        query={query}
        onQueryChange={setQuery}
        onBack={() => onNavigate("dashboard")}
      />

      <main className="max-w-md mx-auto px-4 pb-40">
        {/* Members */}
        <MembersList
          members={filtered}
          statusMap={session.statusMap}
          notesMap={session.notesMap}
          onPresent={(id) => updateStatus(id, "present")}
          onNotified={openSheetFor}
          onAbsent={(id) => updateStatus(id, "absent")}
        />

        {/* Session + Photos */}
        <section className="mt-6 grid gap-4">
          <SessionCard
            title={session.title}
            date={session.date}
            note={session.sessionNote}
            onTitleChange={setTitle}
            onDateChange={setDate}
            onNoteChange={setSessionNote}
          />

          <MultiPhotoUpload
            uploads={photoUploads}
            onFilesChange={handleFilesChange}
            onRemove={handleRemovePhoto}
          />
        </section>
      </main>

      {/* Floating CTA */}
      <SubmitBar
        counts={counts}
        onOpenSummary={() => setShowSummary(true)}
        onSubmit={() => setShowSummary(true)}
      />

      {/* Sheet (store-connected; no props) */}
      <NotifiedSheet />

      <SummaryModal
        open={showSummary}
        onClose={() => {
          setShowSummary(false);
          if (submitStatus === "error") setSubmitStatus("idle");
        }}
        counts={counts}
        members={members}
        photoUploads={photoUploads}
        statusMap={session.statusMap}
        notesMap={session.notesMap}
        onResetAll={() => {
          if (confirm(t("attendance:summaryModal.confirmReset"))) {
            resetSession();
            resetPhotos();
            setShowSummary(false);
          }
        }}
        onConfirm={confirmSubmit}
        submitStatus={submitStatus}
        submitError={submitError}
      />
    </div>
  );
}
