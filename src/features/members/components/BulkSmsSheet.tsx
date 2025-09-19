import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { useTranslation } from "react-i18next";

// Robust, gesture-safe copy with fallbacks (iOS/Safari + HTTP dev)
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function isIOS() {
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = (navigator as any).platform === "MacIntel" && (navigator as any).maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

function isAndroid() {
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /Android/i.test(ua);
}

export const BulkSmsSheet = memo(function BulkSmsSheet({
  open,
  recipients,
  onClose,
}: {
  open: boolean;
  recipients: string[];
  onClose: () => void;
}) {
  const { t } = useTranslation(['members', 'common']);
  const [body, setBody] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [copiedList, setCopiedList] = useState(false);
  const [copiedNumbersBtn, setCopiedNumbersBtn] = useState(false);
  const closingTimer = useRef<number | null>(null);

  const limited = useMemo(() => {
    const MAX = 30;
    return recipients.slice(0, MAX);
  }, [recipients]);

  const androidHref = useMemo(() => {
    const addrs = limited.join(";");
    const q = body ? `?body=${encodeURIComponent(body)}` : "";
    return `smsto:${addrs}${q}`;
  }, [limited, body]);

  const visibleList = expanded ? recipients : recipients.slice(0, 12);

  const handleCopyNumbers = useCallback(async () => {
    const ok = await copyText(recipients.join(", "));
    setCopiedNumbersBtn(ok);
    if (ok) {
      window.setTimeout(() => setCopiedNumbersBtn(false), 1400);
    }
  }, [recipients]);

  const handleOpenMessages = useCallback(async () => {
    if (isIOS()) {
      const ok = await copyText(recipients.join(", "));
      setCopiedList(ok);
      window.setTimeout(() => {
        window.location.href = "sms:";
      }, 50);
      if (closingTimer.current) window.clearTimeout(closingTimer.current);
      closingTimer.current = window.setTimeout(() => setCopiedList(false), 2000) as unknown as number;
    } else if (isAndroid()) {
      window.location.href = androidHref;
    } else {
      const ok = await copyText(recipients.join(", "));
      setCopiedList(ok);
      window.location.href = "sms:";
    }
  }, [recipients, androidHref]);

  return (
    <BottomSheet open={open} onClose={onClose} label={t('bulkSmsSheet.label')}>
      <div className="mx-auto h-1 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700 mb-3" />

      <div className="font-semibold mb-1">
        {t('bulkSmsSheet.title', { count: recipients.length })}
      </div>

      {isIOS() && recipients.length > 1 && (
        <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-2 mb-2">
          {t('bulkSmsSheet.iosWarning')}
        </div>
      )}
      {recipients.length > 30 && (
        <div className="text-xs text-neutral-500 mb-2">
          {t('bulkSmsSheet.limitWarning')}
        </div>
      )}

      <label className="block text-xs mb-1">{t('bulkSmsSheet.messageLabel')}</label>
      <textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t('bulkSmsSheet.messagePlaceholder')}
        className="w-full text-sm rounded-xl p-3 bg-neutral-100/80 dark:bg-neutral-900/80 outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
      />

      <div className="mt-3">
        <button onClick={() => setExpanded((v) => !v)} className="text-xs underline opacity-70 hover:opacity-100">
          {expanded ? t('bulkSmsSheet.hideRecipients') : t('bulkSmsSheet.viewRecipients', { count: recipients.length })}
        </button>
        {visibleList.length > 0 && (
          <div className="mt-2 max-h-36 overflow-auto rounded-xl border border-neutral-200 dark:border-neutral-800 p-2 text-xs">
            {visibleList.map((n, i) => (
              <div key={i} className="truncate">
                {n}
              </div>
            ))}
            {!expanded && recipients.length > visibleList.length && (
              <div className="mt-1 text-neutral-500">
                {t('bulkSmsSheet.andMore', { count: recipients.length - visibleList.length })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 mt-3">
        <button
          onClick={handleCopyNumbers}
          className={`px-3 py-2 text-sm rounded-xl border hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
            copiedNumbersBtn
              ? "border-green-300 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-200"
              : "border-neutral-200 dark:border-neutral-700"
          }`}
          aria-live="polite"
        >
          {copiedNumbersBtn ? t('detailSheet.copied') : t('bulkSmsSheet.copyNumbers')}
        </button>

        <button
          onClick={handleOpenMessages}
          className={`px-4 py-2 text-sm rounded-xl font-semibold text-white ${
            copiedList ? "bg-green-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isIOS() && recipients.length > 1
            ? copiedList
              ? t('bulkSmsSheet.openMessagesIosCopied')
              : t('bulkSmsSheet.openMessagesIos')
            : t('bulkSmsSheet.openMessages')}
        </button>
      </div>
    </BottomSheet>
  );
});
