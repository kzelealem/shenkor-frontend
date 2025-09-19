export type UploadStatus = "uploading" | "done" | "error";

export type PhotoUpload = {
  id: string;
  file: File;
  status: UploadStatus;
  previewUrl: string;
  finalUrl?: string;
  error?: string;
  progress?: number; // 0..1 (optional)
};

export type Counts = {
  present: number;
  notified: number;
  absent: number;
  marked: number;
  total: number;
};

export type SubmitStatus = "idle" | "submitting" | "error" | "success";
