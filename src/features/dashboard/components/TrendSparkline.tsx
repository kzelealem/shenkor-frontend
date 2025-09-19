import type { AttendanceRecordSummary } from "@/types";
import { useTranslation } from "react-i18next";

function buildSparkline(
  values: number[],
  w = 320,
  h = 72,
  padX = 8,
  padY = 10
) {
  const viewBox = `0 0 ${w} ${h}`;
  if (!values.length) return { d: "", pts: [] as { x: number; y: number }[], viewBox };

  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(1e-9, max - min);
  const step = values.length === 1 ? innerW : innerW / (values.length - 1);

  const pts: { x: number; y: number }[] = values.map((v, i) => {
    const x = padX + i * step;
    const yNorm = (v - min) / span;
    const y = padY + innerH - yNorm * innerH;
    return { x, y };
  });

  const [first, ...rest] = pts;
  const d = first
    ? `M ${first.x},${first.y} ` + rest.map((p) => `L ${p.x},${p.y}`).join(" ")
    : "";

  return { d, pts, viewBox };
}

export function TrendSparkline({ points }: { points: AttendanceRecordSummary[] }) {
  const { t } = useTranslation('dashboard');
  const series = (points ?? [])
    .slice()
    .reverse() // oldest → newest
    .map((p) => (p.counts.total ? Math.round((p.counts.present / p.counts.total) * 100) : 0));

  const { d, pts, viewBox } = buildSparkline(series);
  const label = series.length ? t('trend.label', { count: series.length }) : t('trend.noData');

  return (
    <div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
        {t('trend.title')} • {label}
      </div>
      {series.length ? (
        <svg viewBox={viewBox} role="img" aria-label={t('trend.title')} className="w-full h-16">
          <path d={d} fill="none" stroke="currentColor" strokeWidth={2} className="text-emerald-500" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2} className="fill-current text-emerald-600" />
          ))}
        </svg>
      ) : (
        <div className="text-sm text-neutral-500">{t('trend.noData')}</div>
      )}
    </div>
  );
}