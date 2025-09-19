import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useTranslation } from "react-i18next";

type HlgMeta = {
  schedule: { weekday: number; cadence: "weekly" | "biweekly"; time: string };
  location?: string;
  nextMeetingDate?: string;
};

export function NextMeetingCard({ meta }: { meta?: HlgMeta }) {
  const { t, i18n } = useTranslation('dashboard');

  if (!meta) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">{t('nextMeeting.title')}</CardTitle></CardHeader>
        <CardContent className="text-sm text-neutral-500 dark:text-neutral-400">{t('nextMeeting.noSchedule')}</CardContent>
      </Card>
    );
  }
  const nextStr = meta.nextMeetingDate
    ? new Date(meta.nextMeetingDate).toLocaleString(i18n.language, { weekday: "short", month: "short", day: "2-digit" })
    : t('nextMeeting.tbd');
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t('nextMeeting.title')}</CardTitle></CardHeader>
      <CardContent className="text-sm">
        <div className="font-medium">{t('nextMeeting.time', { date: nextStr, time: meta.schedule.time })}</div>
        {meta.location ? <div className="text-neutral-500 dark:text-neutral-400">{meta.location}</div> : null}
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('nextMeeting.cadence', { cadence: meta.schedule.cadence })}</div>
      </CardContent>
    </Card>
  );
}