import * as React from "react";
import { Chip } from "@/components/Chip";
import type { Counts } from "./types";
import { useTranslation } from "react-i18next";

type Props = {
  counts: Counts;
  unmarkedCount: number;
};

export const ProgressChips = React.memo(function ProgressChips({
  counts,
  unmarkedCount,
}: Props) {
  const { t } = useTranslation("attendance");

  return (
    <div
      className="flex items-center gap-2 text-xs"
      role="status"
      aria-live="polite"
    >
      <Chip color="green">
        {t("chips.present", { count: counts.present })}
      </Chip>
      <Chip color="amber">
        {t("chips.notified", { count: counts.notified })}
      </Chip>
      <Chip color="red">
        {t("chips.noShow", { count: counts.absent })}
      </Chip>
      {unmarkedCount > 0 && (
        <Chip color="gray">
          {t("chips.unmarked", { count: unmarkedCount })}
        </Chip>
      )}
    </div>
  );
}, areEqual);

/** Avoid re-renders when values are unchanged, even if 'counts' object identity changes. */
function areEqual(prev: Props, next: Props) {
  const a = prev.counts;
  const b = next.counts;
  return (
    prev.unmarkedCount === next.unmarkedCount &&
    a.present === b.present &&
    a.notified === b.notified &&
    a.absent === b.absent &&
    a.marked === b.marked &&
    a.total === b.total
  );
}
