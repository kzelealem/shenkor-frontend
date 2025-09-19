export const vibrate = (pattern: number | number[] = 10) => {
  try {
    if (typeof window !== "undefined" && navigator?.vibrate) navigator.vibrate(pattern);
  } catch {
    /* noop */
  }
};

export const cn = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

