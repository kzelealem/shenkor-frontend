import React, { memo, useId, useMemo } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { cn } from "@/lib/a11y";
import { useTranslation } from "react-i18next";
import { useAttendanceStore } from "./store/useAttendanceStore";
import { useShallow } from "zustand/react/shallow";

const NOTE_MAX = 200;

export const NotifiedSheet = memo(function NotifiedSheet() {
  const { t } = useTranslation(["attendance", "common"]);
  const noteId = useId();
  const subtitleId = useId();
  const remainingId = useId();

  // Use the useShallow helper so we pass only ONE argument to the hook (satisfying TS),
  // while still getting shallow-equality on the object result to avoid infinite re-renders.
  const {
    open,
    tempReason,
    tempNote,
    setTempReason,
    setTempNote,
    closeSheet,
    saveSheet,
  } = useAttendanceStore(
    useShallow((s) => ({
      open: s.sheet.open,
      tempReason: s.sheet.tempReason,
      tempNote: s.sheet.tempNote,
      setTempReason: s.setTempReason,
      setTempNote: s.setTempNote,
      closeSheet: s.closeSheet,
      saveSheet: s.saveSheet,
    }))
  );

  // Safely coerce i18n returnObjects => string[]
  const quickReasons = useMemo<string[]>(() => {
    const raw = t("attendance:notifiedSheet.reasons", { returnObjects: true }) as unknown;
    if (Array.isArray(raw)) return raw.map(String);
    if (raw && typeof raw === "object") return Object.values(raw as Record<string, unknown>).map(String);
    return [];
  }, [t]);

  const remaining = Math.max(0, NOTE_MAX - (tempNote?.length ?? 0));
  const canSave = (tempReason?.trim()?.length ?? 0) > 0 || (tempNote?.trim()?.length ?? 0) > 0;

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    if (canSave) saveSheet();
  };

  return (
    <BottomSheet open={open} onClose={closeSheet} label={t("attendance:notifiedSheet.label")}>
      <form onSubmit={onSubmit} className="contents">
        <div className="mb-1 text-base font-semibold">
          {t("attendance:notifiedSheet.title")}
        </div>

        <div id={subtitleId} className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
          {t("attendance:notifiedSheet.subtitle")}
        </div>

        {quickReasons.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2" aria-labelledby={subtitleId}>
            {quickReasons.map((r) => {
              const active = tempReason === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTempReason(active ? "" : r)}
                  aria-pressed={active}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-sm border transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-amber-300/60",
                    active
                      ? "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
                      : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  )}
                >
                  {r}
                </button>
              );
            })}
          </div>
        )}

        <label htmlFor={noteId} className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">
          {t("attendance:notifiedSheet.noteLabel")}
        </label>

        <div className="relative">
          <textarea
            id={noteId}
            rows={3}
            maxLength={NOTE_MAX}
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value)}
            placeholder={t("attendance:notifiedSheet.notePlaceholder")}
            className={cn(
              "w-full rounded-2xl p-3",
              "bg-neutral-100/80 dark:bg-neutral-800/80",
              "outline-none focus:ring-2 ring-amber-300",
              "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "text-[15px] leading-5"
            )}
            aria-describedby={remainingId}
          />
          <span
            id={remainingId}
            className="pointer-events-none absolute bottom-2 right-3 text-[11px] tabular-nums text-neutral-500 dark:text-neutral-400"
            aria-live="polite"
          >
            {remaining}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeSheet}
            className={cn(
              "px-3 py-2 text-sm rounded-xl border",
              "border-neutral-200 dark:border-neutral-700",
              "hover:bg-neutral-50 dark:hover:bg-neutral-800",
              "focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
            )}
          >
            {t("common:cancel")}
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className={cn(
              "px-4 py-2 text-sm rounded-xl font-semibold text-white",
              canSave
                ? "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-300/70"
                : "bg-neutral-400 cursor-not-allowed"
            )}
          >
            {t("common:save")}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
});
