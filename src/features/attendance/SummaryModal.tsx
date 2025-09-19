import { memo, useMemo } from "react";
import { Modal } from "@/components/Modal";
import { XIcon } from "@/components/Icon";
import { Stat } from "@/components/Stat";
import { StatusPill } from "@/components/StatusPill";
import type { AttendanceStatus, Member, NotifiedNote } from "@/types";
import type { Counts, SubmitStatus, PhotoUpload } from "./types";
import { cn } from "@/lib/a11y";
import { useTranslation } from "react-i18next";

const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export const SummaryModal = memo(function SummaryModal({
  open,
  onClose,
  counts,
  members,
  photoUploads,
  statusMap,
  notesMap,
  onResetAll,
  onConfirm,
  submitStatus,
  submitError,
}: {
  open: boolean;
  onClose: () => void;
  counts: Counts;
  members: Member[];
  photoUploads: PhotoUpload[];
  statusMap: Record<string, AttendanceStatus>;
  notesMap: Record<string, NotifiedNote>;
  onResetAll: () => void;
  onConfirm: () => void;
  submitStatus: SubmitStatus;
  submitError: string;
}) {
  const { t } = useTranslation(['attendance', 'common']);
  const isSubmitting = submitStatus === "submitting";
  const hasUploadError = useMemo(() => photoUploads.some(p => p.status === 'error'), [photoUploads]);
  const isUploading = useMemo(() => photoUploads.some(p => p.status === 'uploading'), [photoUploads]);

  const submitButtonText = useMemo(() => {
    if (isUploading) return t('summaryModal.buttonUploading');
    if (submitStatus === 'error') return t('summaryModal.buttonRetry');
    if (isSubmitting) return t('summaryModal.buttonSubmitting');
    return t('summaryModal.buttonConfirm');
  }, [isSubmitting, submitStatus, isUploading, t]);


  const handleConfirm = () => {
    if (submitStatus === "error" || submitStatus === "idle") {
      onConfirm();
    }
  };

  const rows = useMemo(() => {
    return members.map((m) => {
      const s = statusMap[m.id] || "unmarked";
      const n = notesMap[m.id];
      return {
        id: m.id,
        name: m.name,
        status: s,
        noteText:
          s === "notified" && (n?.reason || n?.note)
            ? [n.reason, n.note].filter(Boolean).join(" — ")
            : null,
      };
    });
  }, [members, statusMap, notesMap]);

  return (
    <Modal open={open} onClose={onClose} label={t('summaryModal.label')}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{t('summaryModal.title')}</div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label={t('summaryModal.closeAria')}
        >
          <XIcon />
        </button>
      </div>

      <div className="text-sm grid grid-cols-3 gap-2 mb-3">
        <Stat label={t('statusPill.present')} value={counts.present} color="green" />
        <Stat label={t('statusPill.notified')} value={counts.notified} color="amber" />
        <Stat label={t('statusPill.absent')} value={counts.absent} color="red" />
      </div>

      {photoUploads.length > 0 && (
        <div className="mb-3">
          <p className="text-xs mb-1 text-neutral-600 dark:text-neutral-400">{t('summaryModal.photosAttached')}</p>
          <div className="grid grid-cols-5 gap-2">
            {photoUploads.map((upload) => (
              <img key={upload.id} src={upload.previewUrl} alt={upload.file.name} className="aspect-square w-full object-cover rounded-md" />
            ))}
          </div>
        </div>
      )}

      <div className="max-h-48 overflow-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-xs">
          <thead className="bg-neutral-50 dark:bg-neutral-900/50 sticky top-0">
            <tr className="text-left">
              <th className="p-2">{t('summaryModal.tableHeaderName')}</th>
              <th className="p-2">{t('summaryModal.tableHeaderStatus')}</th>
              <th className="p-2">{t('summaryModal.tableHeaderNote')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="p-2 whitespace-nowrap">{r.name}</td>
                <td className="p-2 whitespace-nowrap">
                  <StatusPill status={r.status} />
                </td>
                <td className="p-2">{r.noteText ? <span className="opacity-80">{r.noteText}</span> : <span className="opacity-40">{t('statusPill.unmarked')}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {submitStatus === "error" && (
        <div className="mt-3 p-3 text-xs text-red-800 bg-red-100 dark:bg-red-900/20 dark:text-red-200 rounded-xl border border-red-200 dark:border-red-800/50">
          <strong>{t('summaryModal.error', { error: '' })}</strong> {submitError}
        </div>
      )}
      {hasUploadError && (
        <div className="mt-3 p-3 text-xs text-amber-800 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-200 rounded-xl border border-amber-200 dark:border-amber-800/50">
          <strong>{t('summaryModal.uploadError')}</strong>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <button onClick={onResetAll} className="text-xs underline opacity-70 hover:opacity-100 disabled:opacity-40" disabled={isSubmitting}>
          {t('summaryModal.resetAll')}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40"
            disabled={isSubmitting}
          >
            {t('common:back')}
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              "px-4 py-2 text-sm rounded-xl font-semibold text-white flex items-center justify-center min-w-[140px]",
              submitStatus === "error" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700",
              "disabled:bg-gray-400 disabled:cursor-not-allowed"
            )}
            disabled={isSubmitting || isUploading}
          >
            {(isSubmitting || isUploading) && <Spinner />}
            {submitButtonText}
          </button>
        </div>
      </div>
    </Modal>
  );
});
