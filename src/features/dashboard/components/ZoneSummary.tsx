import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useTranslation } from "react-i18next";

type ZoneMeta = { hlgCount: number; averageAttendancePercentage: number; rankInDistrict?: number; districtName?: string };

export function ZoneSummary({ zoneMeta }: { zoneMeta?: ZoneMeta }) {
  const { t } = useTranslation('dashboard');

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t('zoneSummary.title')}</CardTitle></CardHeader>
      <CardContent className="text-sm">
        {zoneMeta ? (
          <div className="space-y-1">
            <div>{t('zoneSummary.hlgCount')}: <span className="font-medium">{zoneMeta.hlgCount}</span></div>
            <div>{t('zoneSummary.avgAttendance')}: <span className="font-medium">{Math.round(zoneMeta.averageAttendancePercentage)}%</span></div>
            {zoneMeta.rankInDistrict != null ? (
              <div>
                {t('zoneSummary.districtRank')}: <span className="font-medium">#{zoneMeta.rankInDistrict}</span>
                {zoneMeta.districtName ? ` ${t('zoneSummary.inDistrict', { name: zoneMeta.districtName })}` : ""}
              </div>
            ) : null}
          </div>
        ) : <div className="text-neutral-500">{t('zoneSummary.noMetrics')}</div>}
      </CardContent>
    </Card>
  );
}