import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { Member, MemberAttendanceReport } from "@/types";
import { BottomSheet } from "@/components/BottomSheet";
import { Avatar } from "@/components/Avatar";
import { vibrate } from "@/lib/a11y";
import { useAsync } from "@/hooks/useAsync";
import { fetchMemberAttendance } from "@/api/members";
import { Stat } from "@/components/Stat";
import { StatusPill } from "@/components/StatusPill";
import { useTranslation } from "react-i18next";

// keep '+' and digits only (safe for tel/sms/tg)
function digits(p: string): string {
  return (p || "").replace(/[^0-9+]/g, "");
}

// robust clipboard helper
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

type Props = {
  open: boolean;
  member: Member | null;
  onClose: () => void;
};

export const MemberDetailSheet = memo(function MemberDetailSheet({
  open,
  member,
  onClose,
}: Props) {
  const { t, i18n } = useTranslation(["members", "common"]);
  const [copied, setCopied] = useState(false);

  // reset UI state when sheet closes
  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const {
    data: report,
    loading,
    error,
  } = useAsync<MemberAttendanceReport | null>(
    () => (member ? fetchMemberAttendance(member.id) : Promise.resolve(null)),
    [member?.id]
  );

  const full = useMemo(() => {
    if (!member) return "";
    const candidate =
      [member.firstName, member.middleName, member.lastName]
        .filter(Boolean)
        .join(" ") || member.name;
    return candidate.trim();
  }, [member]);

  // URL schemes (sanitize for safety)
  const tel = member?.phone ? `tel:${digits(member.phone)}` : undefined;
  const sms = member?.phone ? `sms:${digits(member.phone)}` : undefined;

  const tgApp = useMemo(() => {
    if (member?.telegramUsername) {
      return `tg://resolve?domain=${member.telegramUsername}`;
    }
    if (member?.phone) {
      return `tg://msg?to=${digits(member.phone)}`;
    }
    return undefined;
  }, [member?.telegramUsername, member?.phone]);

  const copyPhone = useCallback(async () => {
    if (!member?.phone) return;
    const ok = await copyText(member.phone);
    if (ok) {
      setCopied(true);
      vibrate?.(8);
      window.setTimeout(() => setCopied(false), 1200);
    }
  }, [member?.phone]);

  const share = useCallback(async () => {
    try {
      const text = `${full}${member?.phone ? ` — ${member.phone}` : ""}`;
      const navAny = navigator as Navigator & { share?: (d: { title?: string; text?: string }) => Promise<void> };
      if (navAny.share) {
        await navAny.share({ title: full, text });
      } else {
        await copyText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }
      vibrate?.(8);
    } catch {
      // swallow: user cancelled share, etc.
    }
  }, [full, member?.phone]);

  if (!member) return null;

  return (
    <BottomSheet open={open} onClose={onClose} label={t("detailSheet.label")}>
      {/* No custom handle here — BottomSheet provides it */}

      {/* --- Header --- */}
      <div className="sticky top-0 z-10 -mx-3 px-3 py-2 bg-white/80 dark:bg-neutral-900/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <Avatar name={full} photoUrl={member.photoUrl || undefined} />
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate">{full}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {member.phone || t("detailSheet.unspecified")}
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-1 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
            aria-label={t("common:close")}
          >
            {t("common:close")}
          </button>
        </div>
      </div>

      {/* --- Action Buttons --- */}
      <div className="mt-2 mb-3 flex flex-wrap items-center gap-2">
        {tel && (
          <a
            href={tel}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
            aria-label={t("detailSheet.call")}
          >
            {t("detailSheet.call")}
          </a>
        )}
        {sms && (
          <a
            href={sms}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
            aria-label={t("detailSheet.sms")}
          >
            {t("detailSheet.sms")}
          </a>
        )}
        {tgApp && (
          <a
            href={tgApp}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
            aria-label={t("detailSheet.openTelegram")}
          >
            {t("detailSheet.openTelegram")}
          </a>
        )}
        {member.phone && (
          <button
            onClick={copyPhone}
            className={
              "px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 " +
              (copied
                ? "border-green-300 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-200 focus:ring-green-300/60"
                : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:ring-neutral-400/50")
            }
            aria-live="polite"
            aria-pressed={copied}
          >
            {copied ? t("detailSheet.copied") : t("detailSheet.copyPhone")}
          </button>
        )}
        <button
          onClick={share}
          className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
        >
          {t("detailSheet.share")}
        </button>
      </div>

      {/* --- Personal Details --- */}
      <div className="border-t border-neutral-200 pt-3 text-sm dark:border-neutral-800">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[11px] text-neutral-500">{t("detailSheet.firstName")}</div>
            <div className="truncate font-medium">
              {member.firstName || t("detailSheet.unspecified")}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-neutral-500">{t("detailSheet.middleName")}</div>
            <div className="truncate font-medium">
              {member.middleName || t("detailSheet.unspecified")}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-neutral-500">{t("detailSheet.lastName")}</div>
            <div className="truncate font-medium">
              {member.lastName || t("detailSheet.unspecified")}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-neutral-500">{t("detailSheet.batch")}</div>
            <div className="truncate font-medium">
              {member.batchNumber ?? t("detailSheet.unspecified")}
            </div>
          </div>
        </div>
      </div>

      {/* --- Attendance Report Section --- */}
      <div className="mt-4 border-t border-neutral-200 pt-3 dark:border-neutral-800">
        <h3 className="mb-2 text-sm font-semibold">
          {t("detailSheet.attendanceReport")}
        </h3>

        {loading && (
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-16 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          </div>
        )}

        {!loading && error && (
          <p className="text-xs text-rose-600 dark:text-rose-400">
            {t("detailSheet.loadingError")}
          </p>
        )}

        {report && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Stat
                label={t("detailSheet.attendance")}
                value={`${report.summary.attendancePercentage}%`}
                color="green"
              />
              <Stat
                label={t("detailSheet.totalMeetings")}
                value={report.summary.totalMeetings}
              />
            </div>

            {Array.isArray(report.history) && report.history.length > 0 && (
              <div className="max-h-40 overflow-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-neutral-50 dark:bg-neutral-900/50">
                    <tr className="text-left">
                      <th className="p-2">{t("detailSheet.historyDate")}</th>
                      <th className="p-2">{t("detailSheet.historyStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.history.map((item, index) => (
                      <tr
                        key={`${item.date}-${index}`}
                        className="border-t border-neutral-200 dark:border-neutral-800"
                      >
                        <td className="whitespace-nowrap p-2">
                          {new Date(item.date).toLocaleDateString(i18n.language, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="whitespace-nowrap p-2">
                          <StatusPill status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      {/* No extra "safe-bottom" spacer—BottomSheet already handles safe area */}
    </BottomSheet>
  );
});
