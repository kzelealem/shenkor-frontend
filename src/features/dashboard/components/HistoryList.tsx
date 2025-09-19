import type { DashboardData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useTranslation } from "react-i18next";

export function HistoryList({ submissions }: { submissions: DashboardData["recentSubmissions"] }) {
  const { t } = useTranslation('dashboard');
  const { i18n } = useTranslation();

  const formatDate = (dateStr: string) =>
    new Date((/T/.test(dateStr) ? dateStr : `${dateStr}T12:00:00Z`)).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const pct = (present: number, total: number) => (total ? Math.round((present / total) * 100) : 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('history.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {submissions.length ? (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {submissions.map((sub) => {
              const rate = pct(sub.counts.present, sub.counts.total);
              return (
                <li key={sub.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{t('history.attendanceFor', { date: formatDate(sub.date) })}</div>
                    <div className="text-xs text-neutral-500">{t('history.presentPercent', { rate })}</div>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t('history.counts', { present: sub.counts.present, notified: sub.counts.notified, absent: sub.counts.absent })}
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden" aria-hidden>
                    <span
                      className="h-1.5 inline-block align-top bg-emerald-500"
                      style={{ width: `${(sub.counts.present / sub.counts.total) * 100 || 0}%` }}
                    />
                    <span
                      className="h-1.5 inline-block align-top bg-amber-500"
                      style={{ width: `${(sub.counts.notified / sub.counts.total) * 100 || 0}%` }}
                    />
                    <span
                      className="h-1.5 inline-block align-top bg-rose-500"
                      style={{ width: `${(sub.counts.absent / sub.counts.total) * 100 || 0}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-sm text-neutral-500">{t('history.noSubmissions')}</div>
        )}
      </CardContent>
    </Card>
  );
}