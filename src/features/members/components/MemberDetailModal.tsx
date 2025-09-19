import React, { memo, useMemo } from "react";
import type { Member } from "@/types";
import { Modal } from "@/components/Modal";
import { XIcon } from "@/components/Icon";
import { Avatar } from "@/components/Avatar";
import { useTranslation } from "react-i18next";

function digits(p: string) {
  return (p || "").replace(/[^0-9+]/g, "");
}

export const MemberDetailModal = memo(function MemberDetailModal({
  member,
  onClose,
}: {
  member: Member | null;
  onClose: () => void;
}) {
  const { t } = useTranslation(['members', 'common']);
  const open = !!member;
  if (!member) return null;
  
  const full =
    [member.firstName, member.middleName, member.lastName].filter(Boolean).join(" ") ||
    member.name;
    
  const tel = member.phone ? `tel:${member.phone}` : undefined;

  const tgApp = useMemo(() => {
    if (member?.telegramUsername) {
      return `tg://resolve?domain=${member.telegramUsername}`;
    }
    if (member?.phone) {
      return `tg://msg?to=${digits(member.phone)}`;
    }
    return undefined;
  }, [member?.telegramUsername, member?.phone]);


  return (
    <Modal open={open} onClose={onClose} label={t('detailSheet.label', { name: full })}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={full} photoUrl={member.photoUrl || undefined} />
          <div className="min-w-0">
            <div className="font-semibold truncate">{full}</div>
            <div className="text-xs text-neutral-500 truncate">{t('detailSheet.batchLabel', { batch: member.batchNumber ?? t('detailSheet.unspecified') })}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label={t('common:close')}
        >
          <XIcon />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white/80 dark:bg-neutral-900/50">
          <div className="text-xs text-neutral-500">{t('detailSheet.phone')}</div>
          <div className="font-medium">{member.phone || t('detailSheet.unspecified')}</div>
          {tel && (
            <a
              href={tel}
              className="mt-2 inline-block text-xs px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              {t('detailSheet.call')}
            </a>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white/80 dark:bg-neutral-900/50">
          <div className="text-xs text-neutral-500">{t('detailSheet.telegram')}</div>
          <div className="font-medium">
            {member.telegramUsername ? `@${member.telegramUsername}` : (member.phone ? t('detailSheet.viaPhone') : t('detailSheet.unspecified'))}
          </div>
          {tgApp && (
            <div className="mt-2 flex items-center gap-2">
              <a
                href={tgApp}
                className="text-xs px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                {t('detailSheet.openTelegram')}
              </a>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white/80 dark:bg-neutral-900/50">
          <div className="text-xs text-neutral-500">{t('detailSheet.names')}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
            <div>
              <div className="text-[11px] text-neutral-500">{t('detailSheet.firstName')}</div>
              <div className="font-medium">{member.firstName || t('detailSheet.unspecified')}</div>
            </div>
            <div>
              <div className="text-[11px] text-neutral-500">{t('detailSheet.middleName')}</div>
              <div className="font-medium">{member.middleName || t('detailSheet.unspecified')}</div>
            </div>
            <div>
              <div className="text-[11px] text-neutral-500">{t('detailSheet.lastName')}</div>
              <div className="font-medium">{member.lastName || t('detailSheet.unspecified')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          {t('common:close')}
        </button>
      </div>
    </Modal>
  );
});