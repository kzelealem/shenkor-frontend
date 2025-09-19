import React, { useCallback } from "react";
import type { DashboardData } from "@/types";
import { useTranslation } from "react-i18next";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatPhoneDigits(phone: string) {
  return phone.replace(/\D+/g, "");
}

function openTelegram(phone: string, name: string) {
  const digits = formatPhoneDigits(phone);
  const schemeUrl = `tg://msg?to=%2B${digits}`;
  const webShare = `https://t.me/share/url?url=&text=${encodeURIComponent(`Hi ${name}`)}`;
  const t = setTimeout(() => window.open(webShare, "_blank", "noopener,noreferrer"), 600);
  window.location.href = schemeUrl;
  setTimeout(() => clearTimeout(t), 800);
}

export function FollowUpList({ members, onViewAll }: { members: DashboardData["membersToFollowUp"]; onViewAll?: () => void }) {
  const { t } = useTranslation('dashboard');
  const onTelegram = useCallback((phone: string, name: string) => openTelegram(phone, name), []);

  return (
    <section>
      <h3 className="font-semibold mb-2 mt-6">{t('followUp.title')}</h3>
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900 shadow-sm">
        {members.length > 0 ? (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {members.map((member, index) => (
              <li
                key={member.id}
                className="py-2 flex items-center gap-3 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="size-9 rounded-full bg-neutral-100 dark:bg-neutral-800 grid place-items-center text-xs font-semibold">
                  {initials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{member.name}</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{t('followUp.lastSeen', { duration: member.lastSeen })}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${member.phone}`}
                    className="text-xs font-semibold px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  >
                    {t('followUp.call')}
                  </a>
                  <button
                    type="button"
                    onClick={() => onTelegram(member.phone, member.name)}
                    className="text-xs font-semibold px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    title={t('followUp.telegramTitle')}
                  >
                    {t('followUp.telegram')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <div className="mx-auto size-12 grid place-items-center rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z" />
              </svg>
            </div>
            <p className="text-sm font-medium mt-2">{t('followUp.allGoodTitle')}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('followUp.allGoodSubtitle')}</p>
          </div>
        )}
        <button
          className="text-sm w-full flex items-center justify-center gap-2 mt-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 group"
          onClick={onViewAll}
        >
          {t('followUp.viewAll')}
          <svg viewBox="0 0 24 24" className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
