// hooks/usePhotoUploads.ts
import * as React from "react";
import { preparePhotoUploads, uploadPhotoToMinio } from "@/api/attendance";
import type { PhotoUpload } from "../types";

type Options = {
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string[];
  maxConcurrent?: number; // NEW: throttle outbound uploads (default 3)
};

const defaultOpts: Required<Omit<Options, "maxConcurrent">> & { maxConcurrent: number } = {
  maxFiles: 12,
  maxSizeMB: 8,
  accept: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
  maxConcurrent: 3,
};

export function usePhotoUploads(opts?: Options) {
  const o = { ...defaultOpts, ...opts };
  const [uploads, setUploads] = React.useState<PhotoUpload[]>([]);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Keep AbortControllers per id to allow cancellation
  const controllersRef = React.useRef<Map<string, AbortController>>(new Map());

  // revoke blobs on unmount
  React.useEffect(() => {
    return () => {
      controllersRef.current.forEach((c) => c.abort());
      uploads.forEach((u) => {
        if (u.previewUrl.startsWith("blob:")) URL.revokeObjectURL(u.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateFiles = (files: File[]): string | null => {
    if (uploads.length + files.length > o.maxFiles) {
      return `You can attach up to ${o.maxFiles} photos.`;
    }
    for (const f of files) {
      const okType = o.accept.length ? o.accept.includes(f.type) : true;
      if (!okType) return `Unsupported type: ${f.type || "unknown"}.`;
      if (f.size > o.maxSizeMB * 1024 * 1024)
        return `${f.name} is larger than ${o.maxSizeMB}MB.`;
    }
    return null;
  };

  const addFiles = React.useCallback(
    async (newFiles: File[]) => {
      const err = validateFiles(newFiles);
      if (err) {
        setErrorMsg(err);
        return;
      }
      // stage locally
      const staged: PhotoUpload[] = newFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        status: "uploading",
        previewUrl: URL.createObjectURL(file),
        progress: 0,
      }));
      setUploads((prev) => [...prev, ...staged]);

      try {
        // ask server for slots
        const { uploads: slots = [] } = await preparePhotoUploads(staged.map((s) => s.file.name));

        // mark staged items with no slot
        if (slots.length < staged.length) {
          for (let j = slots.length; j < staged.length; j++) {
            const missing = staged[j];
            if (missing) {
              setUploads((prev) =>
                prev.map((u) => (u.id === missing.id ? { ...u, status: "error", error: "No upload URL" } : u))
              );
            }
          }
        }

        // process in small batches to avoid network stampede
        const len = Math.min(staged.length, slots.length);
        let idx = 0;
        const runBatch = async () => {
          const batch = [];
          for (let k = 0; k < o.maxConcurrent && idx < len; k++, idx++) {
            const item = staged[idx]!;
            const slot = slots[idx]!;
            const ac = new AbortController();
            controllersRef.current.set(item.id, ac);

            batch.push(
              (async () => {
                try {
                  await uploadPhotoToMinio(slot.presignedUrl, item.file, ac.signal);
                  setUploads((prev) =>
                    prev.map((u) =>
                      u.id === item.id
                        ? { ...u, status: "done", finalUrl: slot.finalObjectUrl, progress: 1 }
                        : u
                    )
                  );
                } catch (err) {
                  const message = err instanceof Error ? err.message : "Upload failed";
                  setUploads((prev) =>
                    prev.map((u) => (u.id === item.id ? { ...u, status: "error", error: message } : u))
                  );
                } finally {
                  controllersRef.current.delete(item.id);
                }
              })()
            );
          }
          await Promise.allSettled(batch);
          if (idx < len) await runBatch();
        };

        await runBatch();
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to start uploads.";
        setErrorMsg(message);
        setUploads((prev) =>
          prev.map((u) =>
            staged.some((s) => s.id === u.id) ? { ...u, status: "error", error: "Failed to start" } : u
          )
        );
      }
    },
    [o.accept, o.maxFiles, o.maxSizeMB, o.maxConcurrent]
  );

  const removeById = React.useCallback((id: string) => {
    // cancel inflight if any
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);

    setUploads((prev) => {
      const toRemove = prev.find((p) => p.id === id);
      if (toRemove?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const cancelAll = React.useCallback(() => {
    controllersRef.current.forEach((c) => c.abort());
    controllersRef.current.clear();
    // don't delete files here; just stop uploading
  }, []);

  const resetAll = React.useCallback(() => {
    controllersRef.current.forEach((c) => c.abort());
    controllersRef.current.clear();
    setUploads((prev) => {
      prev.forEach((p) => {
        if (p.previewUrl.startsWith("blob:")) URL.revokeObjectURL(p.previewUrl);
      });
      return [];
    });
  }, []);

  const seedFromUrls = React.useCallback((urls: string[]) => {
    if (!urls?.length) return;
    setUploads((prev) => [
      ...prev,
      ...urls.map((url) => ({
        id: url,
        file: new File([], url.substring(url.lastIndexOf("/") + 1) || "photo.jpg", { type: "image/jpeg" }),
        status: "done" as const,
        previewUrl: url,
        finalUrl: url,
        progress: 1,
      })),
    ]);
  }, []);

  const uploading = uploads.some((u) => u.status === "uploading");
  const hasError = uploads.some((u) => u.status === "error");

  return {
    uploads,
    addFiles,
    removeById,
    resetAll,
    cancelAll,          // NEW
    uploading,
    hasError,
    errorMsg,
    setErrorMsg,
    seedFromUrls,
  };
}
