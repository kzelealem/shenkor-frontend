import * as React from "react";

type Variant = "default" | "secondary" | "outline";
type Props = React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant };

const variants: Record<Variant, string> = {
  default: "bg-neutral-900 text-white",
  secondary: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
  outline:
    "border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 bg-transparent",
};

export function Badge({ className = "", variant = "secondary", ...props }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
