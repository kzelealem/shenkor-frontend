import { memo, useCallback } from "react";
import type { Member } from "@/types";
import { Avatar } from "@/components/Avatar";
import { useTranslation } from "react-i18next";

export const MemberDirectoryRow = memo(function MemberDirectoryRow({
  member,
  onOpen,
}: {
  member: Member;
  onOpen: () => void;
}) {
  const { t } = useTranslation('members');
  const full = [member.firstName, member.middleName, member.lastName].filter(Boolean).join(" ") || member.name;
  const handleOpen = useCallback(() => onOpen(), [onOpen]);

  return (
    <li className="py-3 flex items-center gap-3">
      <Avatar name={full} photoUrl={member.photoUrl || undefined} />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{full}</div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{member.phone || t('detailSheet.unspecified')}</div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleOpen}
          className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          aria-label={t('row.detailsAria', { name: full })}
        >
          {t('row.details')}
        </button>
      </div>
    </li>
  );
}, (prev, next) => prev.member.id === next.member.id);