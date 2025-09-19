import * as React from "react";
import type { AttendanceStatus } from "@/types";
import { cn } from "@/lib/a11y";

type PillSize = "sm" | "md";
type PillVariant = "soft" | "solid" | "outline";

type Props = {
  status: AttendanceStatus;

  /** Optional overrides */
  size?: PillSize;                 // default: "sm"
  variant?: PillVariant;           // default: "soft" (matches your current style)
  withDot?: boolean;               // default: false (pure text like current)
  className?: string;
  /** i18n/label overrides (only provide the ones you want to change) */
  labels?: Partial<Record<AttendanceStatus, string>>;
  /** aria-label override for screen readers */
  ariaLabel?: string;
};

const base = "inline-flex items-center gap-1 rounded-xl border whitespace-nowrap";

const sizeMap: Record<PillSize, string> = {
  sm: "px-2 py-1 text-[11px]",
  md: "px-2.5 py-1.5 text-sm",
};

/* Color palettes by variant */
const soft = {
  present:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800/50",
  notified:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800/50",
  absent:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:border-rose-800/50",
  unmarked:
    "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-900/40 dark:text-neutral-300 dark:border-neutral-800/60",
} as const;

const solid = {
  present: "bg-green-600 text-white border-green-600",
  notified: "bg-amber-500 text-white border-amber-500",
  absent: "bg-rose-500 text-white border-rose-500",
  unmarked:
    "bg-neutral-800 text-white border-neutral-800 dark:bg-neutral-200 dark:text-neutral-900 dark:border-neutral-200",
} as const;

const outline = {
  present:
    "bg-transparent text-green-700 border-green-300 dark:text-green-200 dark:border-green-800/70",
  notified:
    "bg-transparent text-amber-700 border-amber-300 dark:text-amber-200 dark:border-amber-800/70",
  absent:
    "bg-transparent text-rose-700 border-rose-300 dark:text-rose-200 dark:border-rose-800/70",
  unmarked:
    "bg-transparent text-neutral-700 border-neutral-300 dark:text-neutral-300 dark:border-neutral-700",
} as const;

const dotColor = {
  present: "bg-green-500",
  notified: "bg-amber-500",
  absent: "bg-rose-500",
  unmarked: "bg-neutral-400 dark:bg-neutral-500",
} as const;

const LABELS_DEFAULT: Record<AttendanceStatus, string> = {
  present: "Present",
  notified: "Notified",
  absent: "No-show",
  unmarked: "—",
};

export function StatusPill({
  status,
  size = "sm",
  variant = "soft",
  withDot = false,
  className,
  labels,
  ariaLabel,
}: Props) {
  // pick palette by variant
  const palette =
    variant === "solid" ? solid : variant === "outline" ? outline : soft;

  const label = (labels?.[status] ?? LABELS_DEFAULT[status]) as string;

  return (
    <span
      className={cn(base, sizeMap[size], palette[status], className)}
      role="status"
      aria-label={ariaLabel ?? `Status: ${label}`}
      data-status={status}
    >
      {withDot && (
        <span
          aria-hidden
          className={cn(
            "inline-block size-1.5 rounded-full",
            size === "md" && "size-2",
            dotColor[status]
          )}
        />
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}
