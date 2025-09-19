import React, { useMemo } from "react";
import type { DashboardData } from "@/types";
import type { Page } from "@/App";
import { useAsync } from "@/hooks/useAsync";
import { fetchDashboardData } from "@/api/dashboard";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "./components/ui/card";
import { Badge } from "./components/ui/badge";

// Sections
import { PrimaryActionCard } from "./components/PrimaryActionCard";
import { InsightStats } from "./components/InsightStats";
import { TrendSparkline } from "./components/TrendSparkline";
import { NextMeetingCard } from "./components/NextMeetingCard";
import { FollowUpList } from "./components/FollowUpList";
import { HistoryList } from "./components/HistoryList";

export default function DashboardPage({
  onNavigate,
}: {
  onNavigate: (page: Page, context?: { submissionId?: string }) => void;
}) {
  const { t } = useTranslation(['dashboard', 'common']);
  const { data, loading, error, reload } = useAsync<DashboardData>(
    fetchDashboardData,
    []
  );

  const header = useMemo(() => {
    if (!data) return null;
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {data.hlg.name}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('zoneLabel', { name: data.zone.name })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{t('hlgBadge', { id: data.hlg.id })}</Badge>
          <Badge variant="outline">{t('zoneBadge', { id: data.zone.id })}</Badge>
        </div>
      </div>
    );
  }, [data, t]);

  const handleNavigation = (page: Page, submissionId?: string) => {
    onNavigate(page, submissionId ? { submissionId } : undefined);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <div className="h-7 w-48 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-36 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-48 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Card className="border-rose-300 dark:border-rose-700">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-rose-600 dark:text-rose-400">
                {t('loadingError')}
              </div>
              <button
                onClick={() => {
                  void reload();
                }}
                className="px-3 py-1.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60"
              >
                {t('common:retry')}
              </button>
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 break-words">
              {error instanceof Error ? error.message : String(error)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div
      className="p-4 sm:p-6 space-y-6"
      role="main"
      aria-label={t('title')}
    >
      {header}

      {/* Primary action (clean, no pie) */}
      <PrimaryActionCard
        attendance={data.currentWeekAttendance}
        avgAttendance={data.insights.averageAttendancePercentage}
        onNavigate={() => handleNavigation('attendance', data.currentWeekAttendance?.id)}
      />

      {/* Overview: compact KPI tiles + trend line */}
      <Card>
        <CardContent className="pt-4">
          <InsightStats insights={data.insights} compact />
          <div className="mt-3">
            <TrendSparkline points={data.recentSubmissions} />
          </div>
        </CardContent>
      </Card>

      {/* Logistics + people focus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NextMeetingCard meta={data.extras?.hlgMeta} />
        <FollowUpList
          members={data.membersToFollowUp}
          onViewAll={() => onNavigate("members")}
        />{" "}
      </div>

      {/* History, succinct */}
      <HistoryList submissions={data.recentSubmissions} />
    </div>
  );
}