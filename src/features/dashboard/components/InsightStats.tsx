import type { DashboardData } from "@/types";
import { useTranslation } from "react-i18next";

function Box({ label, value, accent }: { label: string; value: string | number; accent?: "amber" | "gray" }) {
  const ring = accent === "amber" ? "ring-amber-200 dark:ring-amber-900/30" : "ring-neutral-200 dark:ring-neutral-800";
  return (
    <div className={`rounded-2xl p-3 ring-1 ${ring}`}>
      <div className="text-xs text-neutral-500 dark:text-neutral-400">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}

export function InsightStats({ insights, compact = false }: { insights: DashboardData["insights"]; compact?: boolean }) {
  const { t } = useTranslation('dashboard');

  return (
    <section>
      {!compact && <h3 className="font-semibold mb-2 mt-1">{t('stats.title')}</h3>}
      <div className="grid grid-cols-3 gap-3">
        <Box label={t('stats.totalMembers')} value={insights.totalMembers} />
        <Box label={t('stats.avgAttendance')} value={`${insights.averageAttendancePercentage}%`} />
        <Box
          label={t('stats.followUps')}
          value={insights.followUpCount}
          accent={insights.followUpCount > 0 ? "amber" : "gray"}
        />
      </div>
    </section>
  );
}
