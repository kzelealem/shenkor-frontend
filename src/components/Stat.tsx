import * as React from "react";
import { cn } from "@/lib/a11y";

type StatColor = "green" | "amber" | "red" | "gray";
type StatSize = "sm" | "md";

type StatProps = {
  /** Primary label (top-left) */
  label: string;
  /** Main value (right side) */
  value: number | string;

  /** Soft color palette background */
  color?: StatColor;
  /** Optional smaller text under the label (e.g., “vs last week”) */
  sublabel?: string;
  /** Optional suffix appended to the value (e.g., "%" or "hrs") */
  suffix?: string;
  /** Format numbers with Intl.NumberFormat (keeps strings untouched) */
  formatNumber?: boolean;
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Compact or regular padding & font sizes */
  size?: StatSize;

  /** Click handler → becomes a button for interactivity */
  onClick?: () => void;

  /** Extra classes for the container */
  className?: string;
  /** Optional a11y label override */
  ariaLabel?: string;
};

const palette: Record<StatColor, string> = {
  green:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800/50",
  amber:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800/50",
  red:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:border-rose-800/50",
  gray:
    "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900/40 dark:text-neutral-200 dark:border-neutral-800/60",
};

const sizeMap: Record<StatSize, { pad: string; label: string; value: string; sub: string; iconBox: string; } > = {
  sm: {
    pad: "p-2.5",
    label: "text-[11px]",
    value: "text-base",
    sub: "text-[10px]",
    iconBox: "size-6 rounded-xl",
  },
  md: {
    pad: "p-3",
    label: "text-xs",
    value: "text-lg",
    sub: "text-[11px]",
    iconBox: "size-7 rounded-2xl",
  },
};

export function Stat({
  label,
  value,
  color = "gray",
  sublabel,
  suffix,
  formatNumber = false,
  icon,
  size = "md",
  onClick,
  className,
  ariaLabel,
}: StatProps) {
  const labelId = React.useId();
  const valueId = React.useId();

  const formatted =
    formatNumber && typeof value === "number"
      ? new Intl.NumberFormat(navigator?.language || "en-US").format(value)
      : value;

  const Value = (
    <div className={cn("font-semibold tabular-nums", sizeMap[size].value)}>
      {formatted}
      {suffix ? <span className="opacity-80 ml-0.5">{suffix}</span> : null}
    </div>
  );

  const content = (
    <>
      {/* Left side: icon + labels */}
      <div className="min-w-0 flex items-center gap-2">
        {icon && (
          <div
            className={cn(
              "grid place-items-center bg-black/5 dark:bg-white/10 shrink-0",
              sizeMap[size].iconBox
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div id={labelId} className={cn(sizeMap[size].label, "opacity-80 truncate")}>
            {label}
          </div>
          {sublabel ? (
            <div className={cn("opacity-60 truncate", sizeMap[size].sub)}>{sublabel}</div>
          ) : null}
        </div>
      </div>

      {/* Right side: value */}
      <div id={valueId} className="shrink-0">
        {Value}
      </div>
    </>
  );

  const baseClasses = cn(
    "rounded-2xl border shadow-sm",
    "flex items-center justify-between gap-3",
    palette[color],
    sizeMap[size].pad,
    onClick &&
      "cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400/50",
    className
  );

  if (onClick) {
    // Interactive variant → button
    return (
      <button
        type="button"
        className={baseClasses}
        onClick={onClick}
        aria-labelledby={labelId}
        aria-describedby={valueId}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }

  // Presentational variant → group
  return (
    <div
      className={baseClasses}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={valueId}
      aria-label={ariaLabel ?? `${label}: ${typeof value === "string" ? value : String(value)}${suffix ?? ""}`}
    >
      {content}
    </div>
  );
}
