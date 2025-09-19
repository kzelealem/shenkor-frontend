import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, DivProps>(function Card(
  { className = "", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm ${className}`}
      {...props}
    />
  );
});

export const CardHeader = React.forwardRef<HTMLDivElement, DivProps>(function CardHeader(
  { className = "", ...props },
  ref
) {
  return <div ref={ref} className={`px-4 pt-4 pb-2 ${className}`} {...props} />;
});

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className = "", ...props }, ref) {
    return <h3 ref={ref} className={`text-base font-semibold ${className}`} {...props} />;
  }
);

export const CardContent = React.forwardRef<HTMLDivElement, DivProps>(function CardContent(
  { className = "", ...props },
  ref
) {
  return <div ref={ref} className={`px-4 pb-4 ${className}`} {...props} />;
});
