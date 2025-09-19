import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { XIcon, CameraIcon } from "@/components/Icon";
import { cn } from "@/lib/a11y";

type Props = {
  file: File | null;
  onFileChange: (file: File | null) => void;

  label?: string; // default: "Meeting Photo (Optional)"
  accept?: string; // default: "image/*"
  captureFromCamera?: boolean; // default: false
  maxSizeMB?: number; // default: undefined (no check)
  className?: string;
};

export function PhotoUpload({
  file,
  onFileChange,
  label = "Meeting Photo (Optional)",
  accept = "image/*",
  captureFromCamera = false,
  maxSizeMB,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const labelId = useId();

  // Create/revoke preview URL safely (prevents memory leaks)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const announce = (msg: string) => {
    setErrorMsg(msg);
    window.setTimeout(() => setErrorMsg(null), 2500);
  };

  const validate = (f: File): boolean => {
    if (maxSizeMB && f.size > maxSizeMB * 1024 * 1024) {
      announce(`File exceeds ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (!selected) return;
    if (!validate(selected)) {
      // clear selection so user can pick again
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    onFileChange(selected);
  };

  const openPicker = () => inputRef.current?.click();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't re-open picker
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white/80 p-3 dark:border-neutral-800 dark:bg-neutral-900/50",
        className
      )}
    >
      <label id={labelId} className="block text-xs mb-2 text-neutral-600 dark:text-neutral-400">
        {label}
      </label>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite">
        {errorMsg || ""}
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-labelledby={labelId}
        onClick={openPicker}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
        className={cn(
          "relative aspect-video w-full rounded-xl border-2 border-dashed grid place-items-center transition-colors cursor-pointer",
          "border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500",
          "focus:outline-none focus:ring-2 focus:ring-amber-300/60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="sr-only"
          {...(captureFromCamera ? { capture: "environment" as any } : {})}
        />

        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Selected photo preview"
              className="absolute inset-0 h-full w-full rounded-xl object-cover"
              loading="lazy"
              decoding="async"
            />
            <button
              onClick={handleRemove}
              aria-label="Remove photo"
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/80"
            >
              <XIcon />
            </button>
          </>
        ) : (
          <div className="text-center text-neutral-500 dark:text-neutral-400">
            <CameraIcon />
            <p className="mt-1 text-sm">Click to upload a photo</p>
          </div>
        )}
      </div>
    </div>
  );
}
