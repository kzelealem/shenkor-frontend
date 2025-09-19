import * as React from "react";

export function RefreshCcw({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      className={className}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9" />
      <polyline points="7 17 2 12 7 7" />
      <path d="M3 12a9 9 0 0 0 18 0" />
      <polyline points="17 7 22 12 17 17" />
    </svg>
  );
}
