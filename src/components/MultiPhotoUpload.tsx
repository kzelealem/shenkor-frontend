import React, { useCallback, useId, useMemo, useRef, useState } from "react";
import type { PhotoUpload } from "@/features/attendance/types";
import { cn } from "@/lib/a11y";
import { XIcon, PlusIcon, LoaderIcon } from "@/components/Icon";

/* ======================================================================= */
/* Types                                                                   */
/* ======================================================================= */

type Props = {
  uploads: PhotoUpload[];
  onFilesChange: (files: File[]) => void;
  onRemove: (id: string) => void;
  /** Optional: accept filter; defaults to images. */
  accept?: string; // e.g. "image/*,.heic"
  /** Optional: client-side cap; if exceeded we still add up to maxFiles and politely announce. */
  maxFiles?: number;
  /** Optional: client-side size limit per file (MB). */
  maxSizeMB?: number;
};

/* ======================================================================= */
/* Utils                                                                   */
/* ======================================================================= */

function uniqueKey(f: File) {
  return `${f.name}-${f.size}-${f.lastModified}`;
}

function filterAccept(files: File[], accept: string) {
  if (!accept || accept === "*") return files;
  const rules = accept
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
  return files.filter((f) => {
    const type = f.type.toLowerCase();
    const name = f.name.toLowerCase();
    return rules.some((rule) =>
      rule.endsWith("/*")
        ? type.startsWith(rule.slice(0, -1))
        : name.endsWith(rule.replace("*", ""))
    );
  });
}

/* ======================================================================= */
/* Upload Grid Item                                                        */
/* ======================================================================= */

function UploadItem({
  upload,
  onRemove,
}: {
  upload: PhotoUpload;
  onRemove: () => void;
}) {
  const isPending = upload.status === "uploading";
  const isError = upload.status === "error";
  const isDone = upload.status === "done";

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
      {/* Image */}
      <img
        src={upload.previewUrl}
        alt={upload.file.name}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />

      {/* Overlay (pending/error/actions). 
          We render a full-cover grid so content is ALWAYS centered. */}
      {(isPending || isError || isDone) && (
        <div
          className={cn(
            "absolute inset-0 grid place-items-center rounded-lg transition-opacity",
            (isPending || isError) && "bg-black/45"
          )}
        >
          {/* Uploading */}
          {isPending && (
            <div
              className="flex items-center justify-center"
              role="status"
              aria-live="polite"
            >
              <LoaderIcon />
              {/* add motion at usage site for control */}
              <div className="absolute">
                <LoaderIcon />
              </div>
              <div className="sr-only">Uploading…</div>
            </div>
          )}

          {/* Error (centered perfectly) */}
          {isError && (
            <div
              className="flex max-w-[85%] flex-col items-center justify-center text-center text-white"
              role="status"
              aria-live="polite"
            >
              <span className="mb-1 text-xl" aria-hidden>
                ⚠️
              </span>
              <p
                className="line-clamp-3 text-[11px] font-semibold leading-tight drop-shadow"
                title={upload.error}
              >
                {upload.error ?? "Upload failed"}
              </p>
              <button
                onClick={onRemove}
                className="mt-2 rounded-full bg-white/20 px-2 py-1 text-[11px] font-medium hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Done → hover to reveal remove control */}
          {isDone && (
            <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <button
                onClick={onRemove}
                aria-label={`Remove photo ${upload.file.name}`}
                className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                <XIcon />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ======================================================================= */
/* Main Component                                                          */
/* ======================================================================= */

export function MultiPhotoUpload({
  uploads,
  onFilesChange,
  onRemove,
  accept = "image/*",
  maxFiles,
  maxSizeMB,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const existingKeys = useMemo(
    () => new Set(uploads.map((u) => uniqueKey(u.file))),
    [uploads]
  );

  const announce = useCallback((msg: string) => {
    setErrorMsg(msg);
    window.setTimeout(() => setErrorMsg(null), 2500);
  }, []);

  const clampToRemaining = useCallback(
    (files: File[]) => {
      if (typeof maxFiles !== "number") return files;
      const remaining = Math.max(0, maxFiles - uploads.length);
      return remaining > 0 ? files.slice(0, remaining) : [];
    },
    [maxFiles, uploads.length]
  );

  const filterBySize = useCallback(
    (files: File[]) => {
      if (!maxSizeMB) return files;
      const maxBytes = maxSizeMB * 1024 * 1024;
      const ok = files.filter((f) => f.size <= maxBytes);
      const rejected = files.length - ok.length;
      if (rejected > 0) {
        announce(
          `Skipped ${rejected} file${rejected > 1 ? "s" : ""} over ${maxSizeMB}MB`
        );
      }
      return ok;
    },
    [maxSizeMB, announce]
  );

  const handleFiles = useCallback(
    (list: FileList | File[] | null) => {
      if (!list) return;
      const arr = Array.from(list);

      let next = filterAccept(arr, accept); // type filter
      next = next.filter((f) => !existingKeys.has(uniqueKey(f))); // dedupe
      next = filterBySize(next); // size filter
      next = clampToRemaining(next); // remaining capacity

      if (next.length > 0) {
        onFilesChange(next);
      } else if (arr.length > 0) {
        announce("No compatible images to add");
      }
    },
    [accept, existingKeys, filterBySize, clampToRemaining, onFilesChange, announce]
  );

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // allow re-selecting same files after removal
    if (inputRef.current) inputRef.current.value = "";
  };

  const remaining =
    typeof maxFiles === "number"
      ? Math.max(0, maxFiles - uploads.length)
      : undefined;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/80 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
      <label
        id={labelId}
        className="mb-2 block text-xs text-neutral-600 dark:text-neutral-400"
      >
        Meeting Photos{" "}
        {typeof maxFiles === "number"
          ? `(${uploads.length}/${maxFiles})`
          : "(Optional)"}
      </label>

      {/* polite announcements for SR users */}
      <div aria-live="polite" className="sr-only">
        {errorMsg || ""}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {uploads.map((u) => (
          <UploadItem key={u.id} upload={u} onRemove={() => onRemove(u.id)} />
        ))}

        {/* Add Tile */}
        <button
          type="button"
          aria-labelledby={labelId}
          onClick={() => inputRef.current?.click()}
          disabled={remaining !== undefined && remaining <= 0}
          className={cn(
            "grid aspect-square w-full place-items-center rounded-lg border-2 border-dashed text-neutral-500 transition-colors",
            "border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500",
            remaining !== undefined && remaining <= 0 && "cursor-not-allowed opacity-40"
          )}
        >
          <PlusIcon />
        </button>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={onFileInput}
          className="sr-only"
        />
      </div>
    </div>
  );
}
