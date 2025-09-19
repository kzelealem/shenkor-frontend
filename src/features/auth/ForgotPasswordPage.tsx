import * as React from "react";
import type { Page } from "@/App";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { AuthShell } from "@/components/AuthShell";
import { LoaderIcon } from "@/components/Icon";

export default function ForgotPasswordPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { t } = useTranslation("auth");
  const { requestReset } = useAuth();

  const emailId = React.useId();
  const errorId = React.useId();

  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await requestReset(email.trim());
      setDone(true);
    } catch (err: any) {
      setError(err?.message || t("forgot.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={t("forgot.title")}
      subtitle={t("forgot.subtitle")}
      onBack={() => onNavigate("login")} // <-- Back button in the card
      footer={
        <button
          className="underline opacity-90 hover:opacity-100 text-xs"
          onClick={() => onNavigate("login")}
        >
          {t("forgot.backToLogin")}
        </button>
      }
    >
      {done ? (
        <div className="text-sm">
          <div className="font-medium text-center">{t("forgot.successTitle")}</div>
          <p className="opacity-80 mt-1 text-center">{t("forgot.successMessage", { email })}</p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="grid gap-3"
          aria-describedby={error ? errorId : undefined}
          aria-busy={busy}
        >
          {error && (
            <div
              id={errorId}
              role="alert"
              aria-live="assertive"
              className="text-sm rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-200 p-2"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor={emailId} className="block text-xs mb-1 text-neutral-600 dark:text-neutral-400">
              {t("login.emailLabel")}
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              disabled={busy}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl px-3 py-3 bg-neutral-100/80 dark:bg-neutral-900/80 outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-2 px-4 py-2 text-sm rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {busy && <LoaderIcon />}
            {busy ? t("forgot.buttonBusy") : t("forgot.button")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
