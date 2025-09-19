import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Member } from "@/types";
import { fetchMyHlgDetails } from "@/api/attendance";
import { SearchBar } from "@/components/SearchBar";
import { PageHeader } from "@/components/PageHeader";
import { MemberDirectoryList } from "./components/MemberDirectoryList";
import { MemberDetailSheet } from "./components/MemberDetailSheet";
import { BulkSmsSheet } from "./components/BulkSmsSheet";
import type { Page } from "@/App";
import { useTranslation } from "react-i18next";

function digits(p: string) {
  return (p || "").replace(/[^0-9]+/g, "");
}

export default function MembersPage({
  onNavigate,
}: {
  onNavigate: (p: Page) => void;
}) {
  const { t } = useTranslation(['members', 'common']);
  const [members, setMembers] = useState<Member[]>([]);
  const [zoneName, setZoneName] = useState<string>(t('common:loading'));
  const [hlgName, setHlgName] = useState<string>(t('common:loading'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const [batchFilter, setBatchFilter] = useState<string>("all");

  const [selected, setSelected] = useState<Member | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchMyHlgDetails();
        if (!alive) return;

        setMembers(
          res.members.map((m: any) => ({
            ...m,
            __lcName: (m.name || "").toLowerCase(),
            __lcPhone: (m.phone || "").toLowerCase(),
            __lcFirst: (m.firstName || "").toLowerCase(),
            __lcMiddle: (m.middleName || "").toLowerCase(),
            __lcLast: (m.lastName || "").toLowerCase(),
            __lcTg: (m.telegramUsername || "").toLowerCase(),
          }))
        );
        setZoneName(res.zone?.name ?? t('common:loading'));
        setHlgName(res.hlg?.name ?? t('common:loading'));
        setError(null);
      } catch (e: any) {
        setError(e?.message || t('pageTitle.loadingError'));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [t]);

  const batches = useMemo(() => {
    const nums = new Set<number>();
    members.forEach((m: any) => {
      if (m.batchNumber != null) nums.add(m.batchNumber);
    });
    return Array.from(nums).sort((a, b) => a - b);
  }, [members]);

  const filtered = useMemo(() => {
    const text = dq.trim().toLowerCase();
    return members.filter((m: any) => {
      const matchesText =
        !text ||
        m.__lcName.includes(text) ||
        m.__lcPhone.includes(text) ||
        m.__lcFirst.includes(text) ||
        m.__lcMiddle.includes(text) ||
        m.__lcLast.includes(text) ||
        m.__lcTg.includes(text);
      const matchesBatch =
        batchFilter === "all" || String(m.batchNumber) === batchFilter;
      return matchesText && matchesBatch;
    });
  }, [members, dq, batchFilter]);

  const smsRecipients = useMemo(() => {
    const nums = new Set<string>();
    filtered.forEach((m: Member) => {
      if (m.phone) nums.add(digits(m.phone));
    });
    return Array.from(nums).filter(Boolean);
  }, [filtered]);

  const clearFilters = useCallback(() => {
    setQ("");
    setBatchFilter("all");
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen">
        <PageHeader
          heading={zoneName}
          title={hlgName}
          badge={"—"}
          onBack={() => onNavigate("dashboard")}
        >
          <div className="h-10 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
        </PageHeader>
        <main className="max-w-md mx-auto px-4 pb-24">
          <div className="grid gap-3">
            <div className="h-10 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-9 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen">
        <PageHeader
          heading={zoneName}
          title={hlgName}
          badge={"!"}
          onBack={() => onNavigate("dashboard")}
        >
          <SearchBar query={q} onChange={setQ} />
        </PageHeader>
        <main className="max-w-md mx-auto px-4 pb-24">
          <div className="rounded-2xl border border-rose-300 dark:border-rose-700 p-4">
            <div className="text-base font-semibold text-rose-600 dark:text-rose-400">
              {t('pageTitle.loadingError')}
            </div>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              {error}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <PageHeader
        heading={zoneName}
        title={`${hlgName}`}
        badge={t('pageTitle.badge', { filteredCount: filtered.length, totalCount: members.length })}
        onBack={() => onNavigate("dashboard")}
      >
        <SearchBar query={q} onChange={setQ} />
      </PageHeader>

      <main className="max-w-md mx-auto px-4 pb-24">
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white/80 dark:bg-neutral-900/50 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-600 dark:text-neutral-400">
              {t('filters.batchLabel')}
            </label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-sm"
              aria-label={t('filters.batchLabel')}
            >
              <option value="all">{t('filters.batchAll')}</option>
              {batches.map((b) => (
                <option key={b} value={String(b)}>
                  {b}
                </option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setBulkOpen(true)}
                disabled={smsRecipients.length === 0}
                className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                aria-label={t('filters.bulkSmsAria', { count: smsRecipients.length })}
              >
                {t('filters.bulkSms', { count: smsRecipients.length })}
              </button>

              {(batchFilter !== "all" || q.trim()) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  {t('common:clear')}
                </button>
              )}
            </div>
          </div>
        </section>

        {filtered.length === 0 ? (
          <div className="text-sm text-neutral-500">
            {t('list.noResults')}
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            <MemberDirectoryList members={filtered} onOpen={setSelected} />
          </ul>
        )}
      </main>

      <MemberDetailSheet
        open={!!selected}
        member={selected}
        onClose={() => setSelected(null)}
      />

      <BulkSmsSheet
        open={bulkOpen}
        recipients={smsRecipients}
        onClose={() => setBulkOpen(false)}
      />
    </div>
  );
}