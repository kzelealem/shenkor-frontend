// MembersList.tsx
import { memo, useMemo } from "react";
import type { AttendanceStatus, Member, NotifiedNote } from "@/types";
import { MemberRow } from "./MemberRow";
import { useTranslation } from "react-i18next";
import { UsersIcon } from "@/components/Icon";
import { cn } from "@/lib/a11y";

type Props = {
  members: ReadonlyArray<Member>;
  statusMap: Readonly<Record<string, AttendanceStatus>>;
  notesMap: Readonly<Record<string, NotifiedNote>>;
  onPresent: (id: string) => void;
  onNotified: (id: string) => void;
  onAbsent: (id: string) => void;
  className?: string;
  virtualized?: boolean; // NEW (defaults false)
};

export const MembersList = memo(function MembersList({
  members,
  statusMap,
  notesMap,
  onPresent,
  onNotified,
  onAbsent,
  className,
  virtualized = false,
}: Props) {
  const { t } = useTranslation("attendance");

  const countLabel = useMemo(
    () =>
      t("membersList.count", {
        count: members.length,
        defaultValue: "{{count}} members",
      }),
    [members.length, t]
  );

  if (members.length === 0) {
    return (
      <div
        className={cn(
          "py-10 text-center text-sm text-neutral-500 dark:text-neutral-400",
          "rounded-2xl border border-neutral-200 dark:border-neutral-800",
          "bg-white/60 dark:bg-neutral-900/40"
        )}
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto mb-2 size-8 text-neutral-300 dark:text-neutral-600">
          <UsersIcon />
        </div>
        <div className="font-medium">
          {t("membersList.emptyTitle", { defaultValue: "No members to show" })}
        </div>
        <div className="text-xs mt-1 opacity-80">
          {t("membersList.emptyHint", {
            defaultValue: "Try adjusting your search or refreshing.",
          })}
        </div>
      </div>
    );
  }

  if (!virtualized) {
    return (
      <section aria-label={t("membersList.ariaLabel", { defaultValue: "Members" })}>
        <span className="sr-only" aria-live="polite">
          {countLabel}
        </span>
        <ul className={cn("divide-y divide-neutral-200 dark:divide-neutral-800", className)}>
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              status={statusMap[m.id] ?? "unmarked"}
              note={notesMap[m.id]}
              onPresent={onPresent}
              onNotified={onNotified}
              onAbsent={onAbsent}
            />
          ))}
        </ul>
      </section>
    );
  }

  // Tiny virtualized mode (no extra dependency): if you want full perf, switch to @tanstack/react-virtual.
  const ITEM_HEIGHT = 64; // px; row is ~56–60px high; give a little buffer
  const viewportH = 480; // fits the typical viewport
  const visibleCount = Math.ceil(viewportH / ITEM_HEIGHT) + 6; // overscan

  const [start, end] = [0, Math.min(members.length, visibleCount)];
  const slice = members.slice(start, end);

  return (
    <section aria-label={t("membersList.ariaLabel", { defaultValue: "Members" })}>
      <span className="sr-only" aria-live="polite">
        {countLabel}
      </span>
      <div style={{ height: members.length * ITEM_HEIGHT }} className="relative">
        <ul
          className={cn(
            "divide-y divide-neutral-200 dark:divide-neutral-800 absolute inset-x-0",
            className
          )}
          style={{ transform: `translateY(${start * ITEM_HEIGHT}px)` }}
        >
          {slice.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              status={statusMap[m.id] ?? "unmarked"}
              note={notesMap[m.id]}
              onPresent={onPresent}
              onNotified={onNotified}
              onAbsent={onAbsent}
            />
          ))}
        </ul>
      </div>
    </section>
  );
});
