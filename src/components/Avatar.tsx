import React, { useMemo, useState } from "react";

type AvatarProps = {
  name: string;
  photoUrl?: string;
  size?: number | string;           // default 40px
  className?: string;
  roundedClassName?: string;        // e.g. "rounded-full"
  status?: "online" | "offline" | "busy";
};

const BG = [
  "bg-neutral-100 dark:bg-neutral-800",
  "bg-amber-100 dark:bg-amber-900/30",
  "bg-emerald-100 dark:bg-emerald-900/30",
  "bg-sky-100 dark:bg-sky-900/30",
  "bg-violet-100 dark:bg-violet-900/30",
  "bg-rose-100 dark:bg-rose-900/30",
];

function hueIndex(str: string, mod = BG.length) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

function initialsFrom(rawName: string): string {
  const cleaned =
    (rawName ?? "")
      .replace(/\p{Extended_Pictographic}/gu, "") // strip emoji
      .trim()
      .replace(/\s+/g, " ") || "";

  if (!cleaned) return "?";

  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";

  if (parts.length === 1) {
    const first = parts[0] ?? "";
    // Try split on hyphen/apostrophe for better second letter
    const segments = first.split(/[-'’]/).filter(Boolean);
    const a = segments[0]?.charAt(0) || first.charAt(0) || "";
    const b =
      segments[1]?.charAt(0) ||
      (first.length > 1 ? first.charAt(1) : ""); // fallback to 2nd char
    const res = (a + b).toUpperCase();
    return res || (a || "?").toUpperCase();
  }

  const first = parts[0]?.charAt(0) ?? "";
  const last = parts[parts.length - 1]?.charAt(0) ?? "";
  const res = (first + last).toUpperCase();
  return res || (first || "?").toUpperCase();
}

export function Avatar({
  name,
  photoUrl,
  size = 40,
  className,
  roundedClassName = "rounded-2xl",
  status,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);

  const initials = useMemo(() => initialsFrom(name), [name]);
  const bgClass = BG[hueIndex(name)];
  const dim = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      className={[
        "relative overflow-hidden grid place-items-center text-sm font-semibold select-none",
        roundedClassName,
        bgClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: dim, height: dim }}
      aria-label={name}
      title={name}
    >
      {photoUrl && !failed ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <span className="text-neutral-700 dark:text-neutral-200">{initials}</span>
      )}

      {status && (
        <span
          aria-hidden
          className={[
            "absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-neutral-950",
            status === "online" && "bg-emerald-500",
            status === "busy" && "bg-amber-500",
            status === "offline" && "bg-neutral-400",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      )}
    </div>
  );
}
