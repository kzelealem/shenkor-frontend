import * as React from "react";
import { cn } from "@/lib/a11y";
import { XIcon } from "@/components/Icon";

type Color = "green" | "amber" | "red" | "gray";
type Variant = "soft" | "outline" | "solid";
type Size = "sm" | "md";

type BaseProps = {
  children: React.ReactNode;
  color?: Color;
  variant?: Variant;
  size?: Size;
  className?: string;

  /** Optional icon slots */
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;

  /** Interactive states */
  selected?: boolean;         // toggled state for filters, etc.
  onClick?: () => void;       // becomes a button when provided
  onRemove?: () => void;      // shows a trailing × button

  /** A11y override. If omitted, text content is used by SR. */
  ariaLabel?: string;
};

// If interactive -> button; else -> span (presentational)
type ChipProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> &
  Omit<React.HTMLAttributes<HTMLSpanElement>, keyof BaseProps>;

const sizeMap: Record<Size, string> = {
  sm: "text-[11px] px-2 py-1",
  md: "text-sm px-3 py-1.5",
};

const soft: Record<Color, string> = {
  green:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800/50",
  amber:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800/50",
  red:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:border-rose-800/50",
  gray:
    "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900/40 dark:text-neutral-200 dark:border-neutral-800/60",
};

const outline: Record<Color, string> = {
  green:
    "bg-transparent text-green-700 border-green-300 dark:text-green-200 dark:border-green-800/70",
  amber:
    "bg-transparent text-amber-700 border-amber-300 dark:text-amber-200 dark:border-amber-800/70",
  red:
    "bg-transparent text-rose-700 border-rose-300 dark:text-rose-200 dark:border-rose-800/70",
  gray:
    "bg-transparent text-neutral-700 border-neutral-300 dark:text-neutral-200 dark:border-neutral-700",
};

const solid: Record<Color, string> = {
  green:
    "bg-green-600 text-white border-green-600 dark:bg-green-600 dark:text-white/95 dark:border-green-600",
  amber:
    "bg-amber-500 text-white border-amber-500 dark:bg-amber-500 dark:text-white/95 dark:border-amber-500",
  red:
    "bg-rose-500 text-white border-rose-500 dark:bg-rose-500 dark:text-white/95 dark:border-rose-500",
  gray:
    "bg-neutral-800 text-white border-neutral-800 dark:bg-neutral-200 dark:text-neutral-900 dark:border-neutral-200",
};

const variantMap: Record<Variant, Record<Color, string>> = {
  soft,
  outline,
  solid,
};

export function Chip({
  children,
  color = "gray",
  variant = "soft",
  size = "sm",
  className,
  leadingIcon,
  trailingIcon,
  selected = false,
  onClick,
  onRemove,
  ariaLabel,
  ...rest
}: ChipProps) {
  const interactive = Boolean(onClick || onRemove);
  const Component: any = interactive ? "button" : "span";

  const base = cn(
    "inline-flex items-center gap-1 rounded-xl border select-none",
    sizeMap[size],
    variantMap[variant][color],
    interactive &&
      "cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400/50 dark:focus:ring-neutral-500/50",
    interactive && !selected && "hover:bg-neutral-50/60 dark:hover:bg-neutral-800/60",
    selected &&
      (variant === "soft"
        ? "ring-2 ring-amber-300/60"
        : variant === "outline"
        ? "bg-neutral-50/70 dark:bg-neutral-800/50"
        : "brightness-95"),
    "whitespace-nowrap",
    className
  );

  // For screen readers: fallback to text content if ariaLabel not supplied
  const aria = interactive
    ? {
        "aria-pressed": selected || undefined,
        "aria-label": ariaLabel,
        type: "button" as const,
      }
    : { "aria-label": ariaLabel };

  return (
    <Component className={base} {...aria} {...rest}>
      {leadingIcon && (
        <span className={cn(size === "sm" ? "size-3.5" : "size-4", "shrink-0")}>
          {leadingIcon}
        </span>
      )}

      {/* text */}
      <span className="truncate max-w-[12ch]">{children}</span>

      {/* optional trailing icon (before remove button) */}
      {trailingIcon && (
        <span className={cn(size === "sm" ? "size-3.5" : "size-4", "shrink-0")}>
          {trailingIcon}
        </span>
      )}

      {/* remove button */}
      {onRemove && (
        <span className="ml-0.5 -mr-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove"
            className={cn(
              "grid place-items-center rounded-lg",
              size === "sm" ? "size-4" : "size-5",
              "hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
            )}
          >
            <XIcon size={size === "sm" ? 12 : 14} strokeWidth={2.5} />
          </button>
        </span>
      )}
    </Component>
  );
}
