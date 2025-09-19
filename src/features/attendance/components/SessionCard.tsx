import * as React from "react";
import { useTranslation } from "react-i18next";

export function SessionCard({
  title,
  date,
  note,
  onTitleChange,
  onDateChange,
  onNoteChange,
}: {
  title: string;
  date: string;
  note: string;
  onTitleChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onNoteChange: (v: string) => void;
}) {
  const { t } = useTranslation(["attendance"]);

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white/80 dark:bg-neutral-900/50">
      <div className="grid gap-3">
        <div>
          <label className="block text-xs mb-1 text-neutral-600 dark:text-neutral-400">
            {t("attendance:form.sessionTitleLabel")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t("attendance:form.sessionTitlePlaceholder")}
            className="w-full rounded-xl px-3 py-2 bg-neutral-100/80 dark:bg-neutral-900/80 outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
          />
        </div>
        <div>
          <label className="block text-xs mb-1 text-neutral-600 dark:text-neutral-400">
            {t("attendance:form.sessionDateLabel")}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-xl px-3 py-2 bg-neutral-100/80 dark:bg-neutral-900/80 outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="block text-xs mb-1 text-neutral-600 dark:text-neutral-400">
          {t("attendance:form.notesLabel")}
        </label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={4}
          placeholder={t("attendance:form.notesPlaceholder")}
          className="w-full text-sm rounded-xl p-3 bg-neutral-100/80 dark:bg-neutral-900/80 outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
        />
      </div>
    </div>
  );
}
