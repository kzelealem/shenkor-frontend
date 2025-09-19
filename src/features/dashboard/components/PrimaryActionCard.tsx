import type { AttendanceRecordSummary } from "@/types";
import { Card, CardContent } from "./ui/card";
import { useTranslation } from "react-i18next";

function TinyStat({ label, value, color }: { label: string; value: number; color: "green" | "amber" | "red" }) {
  const bg =
    color === "green"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
      : color === "amber"
      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
      : "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300";
  return (
    <div className={`rounded-xl p-2 text-center ${bg}`}>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[11px] font-medium">{label}</div>
    </div>
  );
}

export function PrimaryActionCard({
  attendance,
  avgAttendance,
  onNavigate,
}: {
  attendance: AttendanceRecordSummary | null;
  avgAttendance: number;
  onNavigate: () => void;
}) {
  const { t } = useTranslation(['dashboard', 'attendance']);

  return (
    <Card>
      <CardContent className="p-4">
        {attendance ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-600" aria-hidden>✓</span>
              <h2 className="font-semibold text-lg">{t('primaryAction.submittedTitle')}</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <TinyStat label={t('attendance:statusPill.present')} value={attendance.counts.present} color="green" />
              <TinyStat label={t('attendance:statusPill.notified')} value={attendance.counts.notified} color="amber" />
              <TinyStat label={t('attendance:statusPill.absent')} value={attendance.counts.absent} color="red" />
            </div>
            <button
              onClick={onNavigate}
              className="w-full sm:w-auto mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            >
              {t('primaryAction.viewButton')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-lg">{t('primaryAction.takeTitle')}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('primaryAction.avgAttendance', { avg: Math.round(avgAttendance) })}</p>
            </div>
            <div>
              <button
                onClick={onNavigate}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-700 active:scale-95 transition-transform"
              >
                {t('primaryAction.takeButton')}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}