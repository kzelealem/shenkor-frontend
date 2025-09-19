import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useTranslation } from "react-i18next";

type Activity = {
  id: string;
  date: string;
  submittedAt: string;
  submittedBy: string;
  photoCount?: number;
  sessionNoteExcerpt?: string;
};

export function ActivityList({ items }: { items: Activity[] }) {
  const { t } = useTranslation('dashboard');

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t('activity.title')}</CardTitle></CardHeader>
      <CardContent>
        {items?.length ? (
          <ul className="divide-y">
            {items.map((a) => (
              <li key={a.id} className="py-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium">
                    {new Date((/T/.test(a.date) ? a.date : `${a.date}T12:00:00`)).toLocaleDateString(undefined, { month: "short", day: "2-digit" })}
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400">{new Date(a.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('activity.by', { name: a.submittedBy })}
                  {a.photoCount ? t('activity.photo', { count: a.photoCount }) : ""}
                </div>
                {a.sessionNoteExcerpt ? <div className="text-xs mt-1 line-clamp-2">{a.sessionNoteExcerpt}</div> : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-neutral-500">{t('activity.noActivity')}</div>
        )}
      </CardContent>
    </Card>
  );
}