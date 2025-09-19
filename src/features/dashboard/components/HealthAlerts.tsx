import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useTranslation } from "react-i18next";

type Health = {
  missingContacts: number;
  dataCompletenessPercent: number;
  policyCompliance: { submissionsThisMonth: number; minRequired: number };
};

export function HealthAlerts({ health, submissionStreak = 0 }: { health?: Health; submissionStreak?: number }) {
  const { t } = useTranslation('dashboard');

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t('health.title')}</CardTitle></CardHeader>
      <CardContent className="text-sm space-y-2">
        <div><span className="font-medium">{t('health.streak', { count: submissionStreak })}</span></div>
        {health ? (
          <>
            <div>
              {t('health.policy')}{" "}
              <span className="font-medium">
                {t('health.policyMonth', { submissions: health.policyCompliance.submissionsThisMonth, required: health.policyCompliance.minRequired })}
              </span>
            </div>
            <div>
              {t('health.missingContacts')}{" "}
              <span className={health.missingContacts > 0 ? "text-amber-600 font-medium" : ""}>{health.missingContacts}</span>
            </div>
            <div>{t('health.completeness')} <span className="font-medium">{Math.round(health.dataCompletenessPercent)}%</span></div>
          </>
        ) : (
          <div className="text-neutral-500">{t('health.noData')}</div>
        )}
      </CardContent>
    </Card>
  );
}