import * as React from "react";
import type { Page } from "@/App";
import { Stat } from "@/components/Stat";
import { cn } from "@/lib/a11y";
import { useTranslation } from "react-i18next";

const SuccessIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-12 h-12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" className="text-green-100 dark:text-green-900/30" />
    <path d="m9 12 2 2 4-4" className="text-green-600 dark:text-green-400" />
  </svg>
);

type SuccessDetails = {
  submissionId: string;
  counts: { present: number; notified: number; absent: number };
};

export function SuccessScreen({
  details,
  onNavigate,
  isUpdate = false,
}: {
  details: SuccessDetails;
  onNavigate: (page: Page) => void;
  isUpdate?: boolean;
}) {
  const { t } = useTranslation("attendance");
  const [copied, setCopied] = React.useState(false);

  const copyId = React.useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(details.submissionId);
      } else {
        // simple fallback
        const ta = document.createElement("textarea");
        ta.value = details.submissionId;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // swallow; no extra UI needed
    }
  }, [details.submissionId]);

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div
        className={cn(
          "w-full max-w-md",
          "rounded-2xl border border-neutral-200 dark:border-neutral-800",
          "bg-white/80 dark:bg-neutral-900/60 shadow-sm",
          "p-5 text-center"
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex justify-center mb-4">
          <SuccessIcon />
        </div>

        <h1 className="text-xl font-semibold">
          {isUpdate ? t("successScreen.titleUpdate") : t("successScreen.titleCreate")}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {t("successScreen.subtitle")}
        </p>

        <div className="grid grid-cols-3 gap-3 my-5">
          <Stat label={t("statusPill.present")} value={details.counts.present} color="green" />
          <Stat label={t("statusPill.notified")} value={details.counts.notified} color="amber" />
          <Stat label={t("statusPill.absent")} value={details.counts.absent} color="red" />
        </div>

        {/* Submission ID row: monospaced, truncation, copy affordance */}
        <div className="flex items-center justify-center gap-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[220px] font-mono">
            {t("successScreen.submissionId", { id: details.submissionId })}
          </p>
          <button
            type="button"
            onClick={copyId}
            className={cn(
              "px-2 py-1 text-[11px] rounded-lg border",
              "border-neutral-200 dark:border-neutral-700",
              "hover:bg-neutral-50 dark:hover:bg-neutral-800",
              copied && "bg-green-50 dark:bg-green-900/20"
            )}
            aria-label="Copy submission ID"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <button
          autoFocus
          onClick={() => onNavigate("dashboard")}
          className="mt-5 w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-700 active:scale-95 transition-transform"
        >
          {t("successScreen.returnToDashboard")}
        </button>
      </div>
    </div>
  );
}
