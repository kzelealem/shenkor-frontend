import * as React from "react";
import { cn } from "@/lib/a11y";

type StatusColor = "green" | "amber" | "red";

type Props = {
  label: string;
  ariaLabel: string;
  active: boolean;
  onClick: () => void;
  color: StatusColor;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "color" | "children" | "aria-label">;

const focusRing: Record<StatusColor, string> = {
  green: "focus-visible:ring-green-300/70",
  amber: "focus-visible:ring-amber-300/70",
  red: "focus-visible:ring-rose-300/70",
};

const activeStyles: Record<StatusColor, string> = {
  green: "bg-green-600 border-green-600 text-white",
  amber: "bg-amber-500 border-amber-500 text-white",
  red: "bg-rose-500 border-rose-500 text-white",
};

const idleStyles =
  "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800";

export function StatusButton({
  label,
  ariaLabel,
  active,
  onClick,
  color,
  children,
  className,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // layout & touch target
        "inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium",
        // motion & focus
        "select-none transition-[background-color,transform] active:scale-95",
        "focus:outline-none focus-visible:ring-2",
        focusRing[color],
        // states
        active ? activeStyles[color] : idleStyles,
        disabled && "opacity-50 cursor-not-allowed active:scale-100 hover:bg-transparent",
        // misc
        className
      )}
      {...rest}
    >
      <span
        className={cn(
          "-ml-0.5 grid place-items-center",
          // keep the icon 16px, don’t shrink text
          "size-4 shrink-0"
        )}
        aria-hidden
      >
        {children}
      </span>
      {/* Hide text on very small screens, but keep for a11y via aria-label */}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
