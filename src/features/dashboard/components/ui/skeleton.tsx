import * as React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-2xl ${className}`} />;
}
