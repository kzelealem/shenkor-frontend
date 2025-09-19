import * as React from "react";
import type { Page } from "@/App";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { AuthShell } from "@/components/AuthShell";
import { LoaderIcon } from "@/components/Icon";

export default function SignupPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { t } = useTranslation("auth");
  const { signUp } = useAuth();

  const nameId = React.useId();
  const emailId = React.useId();
  const pwId = React.useId();
  const errorId = React.useId();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await signUp(name.trim(), email.trim(), pw);
      onNavigate("dashboard");
    } catch (err: any) {
      setError(err?.message || t("signup.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={t("signup.title")}
      subtitle={t("signup.subtitle")}
      onBack={() => onNavigate("login")}
      footer={
        <div className="text-sm">
          <span className="opacity-70">{t("signup.alreadyHaveAccount")}</span>{" "}
          <button
            type="button"
            className="underline opacity-90 hover:opacity-100"
            onClick={() => onNavigate("login")}
          >
            {t("signup.signIn")}
          </button>
        </div>
      }
    >
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
          <label htmlFor={nameId} className="block text-xs mb-1 text-neutral-600 dark:text-neutral-400">
            {t("signup.nameLabel")}
          </label>
          <input
            id={nameId}
            name="name"
            autoComplete="name"
            disabled={busy}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-2xl px-3 py-3 bg-neutral-100/80 dark:bg-neutral-900/80 outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
            placeholder={t("signup.namePlaceholder")}
          />
        </div>

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

        <div>
          <label htmlFor={pwId} className="block text-xs mb-1 text-neutral-600 dark:text-neutral-400">
            {t("login.passwordLabel")}
          </label>
          <div className="relative">
            <input
              id={pwId}
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              disabled={busy}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl px-3 py-3 pr-24 bg-neutral-100/80 dark:bg-neutral-900/80 outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
              placeholder={t("signup.passwordPlaceholder")}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              disabled={busy}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50"
              aria-pressed={showPw}
              aria-label={showPw ? t("login.hidePassword") : t("login.showPassword")}
            >
              {showPw ? t("login.hidePassword") : t("login.showPassword")}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-2 px-4 py-2 text-sm rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {busy && <LoaderIcon />}
          {busy ? t("signup.buttonBusy") : t("signup.button")}
        </button>
      </form>
    </AuthShell>
  );
}
