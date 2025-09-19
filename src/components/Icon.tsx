// components/Icon.tsx
import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
  strokeWidth?: number;
  title?: string;
  className?: string;
};

function BaseIcon({
  size,
  strokeWidth = 2,
  title,
  className,
  children,
  ...rest
}: IconProps) {
  const aria = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };
  const dim = typeof size === "number" ? `${size}px` : size;

  return (
    <svg
      viewBox="0 0 24 24"
      width={dim}
      height={dim}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      shapeRendering="geometricPrecision"
      className={["shrink-0", className].filter(Boolean).join(" ")}
      {...aria}
      {...rest}
    >
      <g vectorEffect="non-scaling-stroke">{children}</g>
    </svg>
  );
}

export const BackIcon = (props: Omit<IconProps, "size" | "strokeWidth"> & { size?: number | string; strokeWidth?: number }) => (
  <BaseIcon size={props.size ?? 20} strokeWidth={props.strokeWidth ?? 2} className={props.className} title={props.title} {...props}>
    <polyline points="15 18 9 12 15 6" />
  </BaseIcon>
);

export const SearchIcon = (props: IconProps) => (
  <BaseIcon size={props.size ?? 20} strokeWidth={props.strokeWidth ?? 2} className={props.className} title={props.title} {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </BaseIcon>
);

export const XIcon = (props: IconProps) => (
  <BaseIcon size={props.size ?? 20} strokeWidth={props.strokeWidth ?? 2} className={props.className} title={props.title} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </BaseIcon>
);

export const CheckIcon = (props: IconProps) => (
  <BaseIcon size={props.size ?? 16} strokeWidth={props.strokeWidth ?? 3} className={props.className} title={props.title} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </BaseIcon>
);

export const BellIcon = (props: IconProps) => (
  <BaseIcon size={props.size ?? 16} strokeWidth={props.strokeWidth ?? 2} className={props.className} title={props.title} {...props}>
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </BaseIcon>
);

export const MinusIcon = (props: IconProps) => (
  <BaseIcon size={props.size ?? 16} strokeWidth={props.strokeWidth ?? 3} className={props.className} title={props.title} {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </BaseIcon>
);

export const ArrowRightIcon = (props: IconProps) => (
  <BaseIcon size={props.size ?? 16} strokeWidth={props.strokeWidth ?? 2} className={props.className} title={props.title} {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </BaseIcon>
);

export const UsersIcon = (props: IconProps) => (
  <BaseIcon size={props.size ?? 20} strokeWidth={props.strokeWidth ?? 2} className={props.className} title={props.title} {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </BaseIcon>
);

export const ClipboardListIcon = (props: IconProps) => (
  <BaseIcon size={props.size ?? 20} strokeWidth={props.strokeWidth ?? 2} className={props.className} title={props.title} {...props}>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <line x1="12" y1="11" x2="12" y2="17" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </BaseIcon>
);

export const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const LoaderIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle className="opacity-25" cx="12" cy="12" r="10" />
    <path className="opacity-75" d="M4 12a8 8 0 018-8" />
  </svg>
);

export const CameraIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);
