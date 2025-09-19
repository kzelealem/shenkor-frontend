import { memo, useCallback, useMemo } from "react";
import type { AttendanceStatus, Member, NotifiedNote } from "@/types";
import { Avatar } from "@/components/Avatar";
import { StatusButton } from "@/components/StatusButton";
import { BellIcon, CheckIcon, MinusIcon } from "@/components/Icon";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/a11y";

type Props = {
  member: Member;
  status: AttendanceStatus;
  note?: NotifiedNote;
  onPresent: (id: string) => void;
  onNotified: (id: string) => void;
  onAbsent: (id: string) => void;
};

export const MemberRow = memo(function MemberRow({
  member,
  status,
  note,
  onPresent,
  onNotified,
  onAbsent,
}: Props) {
  const { t } = useTranslation("attendance");

  const handlePresent = useCallback(() => onPresent(member.id), [onPresent, member.id]);
  const handleNotified = useCallback(() => onNotified(member.id), [onNotified, member.id]);
  const handleAbsent = useCallback(() => onAbsent(member.id), [onAbsent, member.id]);

  const hasNote = !!(note?.reason || note?.note);
  const noteTooltip = useMemo(
    () => [note?.reason, note?.note].filter(Boolean).join(" — "),
    [note?.reason, note?.note]
  );

  return (
    <li className="py-3 flex items-center gap-3">
      <Avatar name={member.name} photoUrl={member.photoUrl || undefined} />

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate flex items-center gap-1.5">
          <span className="truncate">{member.name}</span>
          {hasNote && (
            <>
              <span
                className={cn(
                  "inline-block size-1.5 rounded-full",
                  status === "notified"
                    ? "bg-amber-500"
                    : "bg-neutral-300 dark:bg-neutral-600"
                )}
                title={noteTooltip}
                aria-label="Has note"
              />
              <span className="sr-only">{noteTooltip}</span>
            </>
          )}
        </div>

        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {member.phone?.trim() ? (
            member.phone
          ) : (
            // Visual placeholder with accessible label, no unknown i18n keys
            <span aria-label="No phone">—</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <StatusButton
          label={t("memberRow.present")}
          ariaLabel={t("memberRow.presentAria", { name: member.name })}
          active={status === "present"}
          color="green"
          onClick={handlePresent}
        >
          <CheckIcon />
        </StatusButton>

        <StatusButton
          label={t("memberRow.notified")}
          ariaLabel={t("memberRow.notifiedAria", { name: member.name })}
          active={status === "notified"}
          color="amber"
          onClick={handleNotified}
        >
          <BellIcon />
        </StatusButton>

        <StatusButton
          label={t("memberRow.noShow")}
          ariaLabel={t("memberRow.noShowAria", { name: member.name })}
          active={status === "absent"}
          color="red"
          onClick={handleAbsent}
        >
          <MinusIcon />
        </StatusButton>
      </div>
    </li>
  );
},
(prev, next) =>
  prev.member.id === next.member.id &&
  prev.status === next.status &&
  (prev.note?.reason ?? "") === (next.note?.reason ?? "") &&
  (prev.note?.note ?? "") === (next.note?.note ?? "")
);
