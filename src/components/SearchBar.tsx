import * as React from "react";
import { SearchIcon, XIcon } from "@/components/Icon";
import { cn } from "@/lib/a11y";

type SearchBarProps = {
  /** Controlled query value */
  query: string;
  /** Fires immediately on keystroke (also after debounce if enabled) */
  onChange: (q: string) => void;

  /** Optional placeholder (defaults to “Search name or phone”) */
  placeholder?: string;
  /** Debounce keystrokes before calling onChange (ms). Default: 0 (off) */
  debounceMs?: number;
  /** Called when user presses Enter */
  onSubmit?: (q: string) => void;
  /** Auto-focus the input on mount */
  autoFocus?: boolean;
  /** Disable the control */
  disabled?: boolean;
  /** Focus shortcut (⌘K / Ctrl+K). Default: true */
  hotkey?: boolean;
  /** Extra classes for the wrapper */
  className?: string;
  /** Accessible label (if not using a visible label) */
  ariaLabel?: string;
};

export function SearchBar({
  query,
  onChange,
  placeholder = "Search name or phone",
  debounceMs = 0,
  onSubmit,
  autoFocus,
  disabled,
  hotkey = true,
  className,
  ariaLabel = "Search",
}: SearchBarProps) {
  const id = React.useId();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Internal mirror for debounce; still controlled by `query`
  const [internal, setInternal] = React.useState(query);
  React.useEffect(() => setInternal(query), [query]);

  // Debounced emit
  React.useEffect(() => {
    if (debounceMs <= 0) return;
    const handle = window.setTimeout(() => {
      if (internal !== query) onChange(internal);
    }, debounceMs);
    return () => window.clearTimeout(handle);
  }, [internal, query, onChange, debounceMs]);

  // Global hotkey to focus
  React.useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "k");
      if (!isCmdK) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  const emitChange = (value: string) => {
    setInternal(value);
    if (debounceMs <= 0) onChange(value);
  };

  const clear = () => {
    emitChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      // Clear on Esc
      if (internal) {
        e.preventDefault();
        clear();
      }
      return;
    }
    if (e.key === "Enter") {
      onSubmit?.(internal);
    }
  };

  return (
    <div role="search" className={cn("mt-3", className)}>
      <div className="relative">
        <label htmlFor={id} className="sr-only">
          {ariaLabel}
        </label>
        <input
          id={id}
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoFocus={autoFocus}
          disabled={disabled}
          value={internal}
          onChange={(e) => emitChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/80",
            "pl-10 pr-10 py-3",
            "outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          aria-label={ariaLabel}
        />

        {/* Leading icon */}
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
          <SearchIcon />
        </div>

        {/* Clear button */}
        {internal && !disabled && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center rounded-lg p-1 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
            aria-label="Clear search"
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* Optional hint (only when hotkey is on and not on mobile Safari) */}
      {/* {hotkey && (
        <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          <kbd className="rounded border px-1 py-0.5 text-[10px]">⌘</kbd> /
          <kbd className="ml-0.5 rounded border px-1 py-0.5 text-[10px]">Ctrl</kbd>
          +<kbd className="ml-0.5 rounded border px-1 py-0.5 text-[10px]">K</kbd> to focus
        </div>
      )} */}
    </div>
  );
}
