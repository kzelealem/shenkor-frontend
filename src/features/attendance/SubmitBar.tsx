// SubmitBar.tsx
import { memo, useMemo } from "react";
import { cn } from "@/lib/a11y";
import type { Counts } from "./types";
import { useTranslation } from "react-i18next";

export const SubmitBar = memo(function SubmitBar({
  counts,
  onOpenSummary,
  onSubmit,
}: {
  counts: Counts;
  onOpenSummary: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation("attendance");
  const allMarked = useMemo(
    () => counts.total > 0 && counts.total === counts.marked,
    [counts.total, counts.marked]
  );
  const hasAny = counts.marked > 0;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30"
      aria-hidden={!hasAny}
    >
      <div className="max-w-md mx-auto px-4">
        <div className="h-3" />
        <div
          className={cn(
            "pointer-events-auto rounded-2xl shadow-xl border p-3 backdrop-blur",
            "bg-white/95 dark:bg-neutral-900/95 border-neutral-200 dark:border-neutral-800",
            "mb-[max(12px,env(safe-area-inset-bottom))]" // lifted up + safe area
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm" aria-live="polite">
              <div className="font-medium">
                {t("submitBar.marked", { marked: counts.marked, total: counts.total })}
              </div>
              <div className="text-xs text-neutral-500">{t("submitBar.review")}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSummary}
                disabled={!hasAny}
                className="px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50"
              >
                {t("submitBar.summary")}
              </button>
              <button
                onClick={onSubmit}
                disabled={!hasAny}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed",
                  allMarked
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900"
                )}
              >
                {t("submitBar.submit")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
