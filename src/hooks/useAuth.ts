// src/hooks/useAuth.ts
import { useCallback, useEffect, useState } from "react";
import { loginApi, signupApi, requestResetApi, logoutApi } from "@/api/auth";

/**
 * Global event name to sync auth state across hook instances (same tab)
 */
const AUTH_EVENT = "auth:token";

function broadcastToken(token: string | null) {
  try {
    window.dispatchEvent(new CustomEvent<string | null>(AUTH_EVENT, { detail: token }));
  } catch {}
}

/**
 * Small auth hook that mirrors the token in state and localStorage.
 * - Flips `isAuthed` immediately after login/signup.
 * - Syncs across multiple components/tabs.
 */
export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("auth.token");
    } catch {
      return null;
    }
  });

  // Keep in sync within this tab (custom event) and across tabs (storage)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth.token") setToken(e.newValue);
    };
    const onAuthEvent = (e: Event) => {
      const t = (e as CustomEvent<string | null>).detail ?? null;
      setToken(t);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_EVENT, onAuthEvent as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_EVENT, onAuthEvent as EventListener);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password); // sets localStorage via api/http.ts
    setToken(res.token);                          // <- flip auth immediately
    broadcastToken(res.token);                    // <- notify App’s hook instance
    return res;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const res = await signupApi(name, email, password);
    setToken(res.token);
    broadcastToken(res.token);
    return res;
  }, []);

  const requestReset = useCallback(async (email: string) => {
    await requestResetApi(email);
  }, []);

  const logout = useCallback(() => {
    logoutApi();   // clears localStorage + api module token
    setToken(null);
    broadcastToken(null);
  }, []);

  return { isAuthed: !!token, login, signUp, requestReset, logout };
}
