import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useTranslation } from "react-i18next";

function digits(p: string) { return p.replace(/\D+/g, ""); }
function openTelegram(phone: string) {
  const d = digits(phone);
  const scheme = `tg://msg?to=%2B${d}`;
  const fallback = `https://t.me/share/url?url=&text=${encodeURIComponent("Hello")}`;
  const t = setTimeout(() => window.open(fallback, "_blank", "noopener,noreferrer"), 600);
  window.location.href = scheme;
  setTimeout(() => clearTimeout(t), 800);
}

type Props = { coordinator?: { id: string; name: string; phone: string; email?: string } };

export function CoordinatorPanel({ coordinator }: Props) {
  const { t } = useTranslation('dashboard');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('coordinator.title')}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {coordinator ? (
          <div className="space-y-1">
            <div className="font-medium">{coordinator.name}</div>
            <a className="text-emerald-600 hover:underline" href={`tel:${coordinator.phone}`}>{coordinator.phone}</a>
            {coordinator.email ? (
              <div><a className="text-neutral-500 hover:underline" href={`mailto:${coordinator.email}`}>{coordinator.email}</a></div>
            ) : null}
            <div className="flex gap-2 pt-2">
              <a href={`tel:${coordinator.phone}`} className="px-3 py-1.5 rounded-md text-xs bg-neutral-100 hover:bg-neutral-200">{t('coordinator.call')}</a>
              <button onClick={() => openTelegram(coordinator.phone)} className="px-3 py-1.5 rounded-md text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                {t('coordinator.telegram')}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-neutral-500">{t('coordinator.noInfo')}</div>
        )}
      </CardContent>
    </Card>
  );
}