import * as React from "react";

type Variant = "default" | "outline";
type Size = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  default:
    "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white",
  outline:
    "border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 bg-transparent hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-xl",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-5 text-base rounded-2xl",
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(function Button(
  { className = "", variant = "default", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`${variants[variant]} ${sizes[size]} font-semibold transition-colors ${className}`}
      {...props}
    />
  );
});
