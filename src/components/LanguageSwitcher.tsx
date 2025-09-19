import * as React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/a11y";
import type { AppLocales } from "@/i18n/config";

type LocaleCode = AppLocales; // "en" | "am"

type LanguageOption = {
  code: LocaleCode;
  label: string; // UI label, e.g., "EN", "AM"
};

type Props = {
  locales?: readonly LanguageOption[];
  ariaLabel?: string;
  className?: string;
  size?: "sm" | "md";
};

const DEFAULT_LOCALES: readonly LanguageOption[] = [
  { code: "en", label: "EN" },
  { code: "am", label: "AM" },
] as const;

const sizeMap = {
  sm: { wrapPad: "p-1", segPad: "px-2.5 py-1", text: "text-[11px] font-medium" },
  md: { wrapPad: "p-1", segPad: "px-3 py-1.5", text: "text-xs font-semibold" },
};

export function LanguageSwitcher({
  locales = DEFAULT_LOCALES,
  ariaLabel = "Language",
  className,
  size = "sm",
}: Props) {
  const { i18n } = useTranslation();
  const btnRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const supported: LocaleCode[] = ["en", "am"];
  const base = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0] as LocaleCode;
  const currentBase: LocaleCode = supported.includes(base) ? base : "en";

  const changeLanguage = (code: LocaleCode) => {
    if (code !== currentBase) i18n.changeLanguage(code);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (locales.length === 0) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const idx = Math.max(0, locales.findIndex((l) => l.code === currentBase));
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (idx + dir + locales.length) % locales.length;
    const nextCode = locales[next]?.code;
    if (nextCode) {
      changeLanguage(nextCode);
      btnRefs.current[next]?.focus();
    }
  };

  const s = sizeMap[size];

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      dir={i18n.dir()}
      className={cn(
        "inline-flex items-center rounded-2xl border border-neutral-200 bg-white/80",
        "dark:border-neutral-700 dark:bg-neutral-900/60",
        "backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-900/70",
        s.wrapPad,
        className
      )}
    >
      {locales.map((loc, i) => {
        const active = currentBase === loc.code;
        return (
          <button
            key={loc.code}
            ref={(el) => {
              btnRefs.current[i] = el; // <-- return void
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={loc.label}
            lang={loc.code}
            onClick={() => changeLanguage(loc.code)}
            className={cn(
              "rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60",
              s.segPad,
              s.text,
              active
                ? "bg-neutral-100 text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100"
                : "text-neutral-600 hover:bg-neutral-100/60 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
            )}
          >
            {loc.label}
          </button>
        );
      })}
    </div>
  );
}
