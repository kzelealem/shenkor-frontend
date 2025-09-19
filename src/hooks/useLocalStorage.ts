import { useEffect, useRef, useState } from "react";

type Options = { throttleMs?: number };

export function useLocalStorage<T>(key: string, initial: T, options?: Options) {
  const { throttleMs = 0 } = options ?? {};
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  // Avoid writing if the same JSON content (micro-opt)
  const lastJsonRef = useRef<string>("");
  useEffect(() => {
    const json = JSON.stringify(value);
    if (json === lastJsonRef.current) return;

    if (throttleMs <= 0) {
      try { window.localStorage.setItem(key, json); lastJsonRef.current = json; } catch {}
      return;
    }
    const t = setTimeout(() => {
      try { window.localStorage.setItem(key, json); lastJsonRef.current = json; } catch {}
    }, throttleMs);
    return () => clearTimeout(t);
  }, [key, value, throttleMs]);

  return [value, setValue] as const;
}
