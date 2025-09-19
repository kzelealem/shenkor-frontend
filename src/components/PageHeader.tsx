import React, { useEffect, useState } from "react";
import { BackIcon } from "@/components/Icon";
import { cn } from "@/lib/a11y";

type BadgeColor = "neutral" | "green" | "amber" | "red";

type PageHeaderProps = {
  /** Small line above the title */
  heading?: string;
  /** Main title (rendered as <h1>) */
  title: string;
  /** Optional small badge on the right (use `actions` to fully customize) */
  badge?: string;
  /** Optional custom right-side content (replaces `badge` if provided) */
  actions?: React.ReactNode;
  /** Back button handler (hidden if `hideBack`) */
  onBack?: () => void;
  /** Hide back button entirely */
  hideBack?: boolean;
  /** Accessible label for the back button */
  backLabel?: string;
  /** Visual style for the badge */
  badgeColor?: BadgeColor;
  /** Extra className for the sticky header */
  className?: string;
  /** Children render a secondary row under the main bar (filters, search, etc.) */
  children?: React.ReactNode;
  /** Respect iOS status bar safe area (on by default) */
  safeAreaTop?: boolean;
};

const badgePalette: Record<BadgeColor, string> = {
  neutral:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200",
  green:
    "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-200",
  amber:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200",
  red: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-200",
};

export function PageHeader({
  heading,
  title,
  badge,
  actions,
  onBack = () => alert("Back action (stub)"),
  hideBack = false,
  backLabel = "Go back",
  badgeColor = "neutral",
  className,
  children,
  safeAreaTop = true,
}: PageHeaderProps) {
  const [elevated, setElevated] = useState(false);

  // Add a subtle shadow once the page is scrolled (feels native)
  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-neutral-200 dark:border-neutral-800",
        "backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-950/70",
        elevated && "shadow-[0_1px_0_0_rgba(0,0,0,0.04)]",
        safeAreaTop && "pt-[max(env(safe-area-inset-top),0px)]",
        className
      )}
      role="banner"
    >
      {/* Main bar */}
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
        {!hideBack && (
          <button
            type="button"
            aria-label={backLabel}
            onClick={onBack}
            className={cn(
              // 44px touch target
              "grid size-11 place-items-center rounded-2xl",
              "hover:bg-neutral-100 active:scale-95 dark:hover:bg-neutral-900",
              "focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
            )}
          >
            <BackIcon />
          </button>
        )}

        {/* Title block */}
        <div className="min-w-0 flex-1">
          {heading && (
            <div className="truncate text-sm text-neutral-500 dark:text-neutral-400">
              {heading}
            </div>
          )}
          <h1 className="truncate text-base font-semibold leading-6">
            {title}
          </h1>
        </div>

        {/* Right content: actions > badge */}
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : badge ? (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-1 text-xs",
              badgePalette[badgeColor]
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>

      {/* Secondary row (filters, search, tabs, etc.) */}
      {children && <div className="mx-auto max-w-md px-4 pb-3">{children}</div>}
    </header>
  );
}
