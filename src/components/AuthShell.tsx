import * as React from "react";
import { BackIcon } from "@/components/Icon";
import { cn } from "@/lib/a11y";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode; // e.g., “Create Account”, “Back to Login”
  className?: string;
};

export function AuthShell({ title, subtitle, onBack, children, footer, className }: Props) {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <section
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800",
          "bg-white/80 dark:bg-neutral-900/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70",
          "p-5",
          className
        )}
      >
        {/* Back */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="absolute left-3 top-3 grid size-10 place-items-center rounded-xl hover:bg-neutral-100 active:scale-95 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60"
          >
            <BackIcon />
          </button>
        )}

        {/* Header */}
        <header className="mb-4 mt-1 text-center">
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>
          ) : null}
        </header>

        {/* Body */}
        <div>{children}</div>

        {/* Footer (links etc.) */}
        {footer ? <div className="mt-3 text-center text-sm">{footer}</div> : null}
      </section>
    </div>
  );
}
