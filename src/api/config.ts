const IS_PROD = import.meta.env.PROD;

export const API_BASE = IS_PROD
  ? "https://shenkor-api.halwot.com/api"
  : (import.meta.env.VITE_API_BASE ?? "/api");

export const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
