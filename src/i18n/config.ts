// src/i18n/config.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// English resources
import authEn from "./locales/en/auth.json";
import attendanceEn from "./locales/en/attendance.json";
import dashboardEn from "./locales/en/dashboard.json";
import membersEn from "./locales/en/members.json";
import commonEn from "./locales/en/common.json";

// Amharic resources
import authAm from "./locales/am/auth.json";
import attendanceAm from "./locales/am/attendance.json";
import dashboardAm from "./locales/am/dashboard.json";
import membersAm from "./locales/am/members.json";
import commonAm from "./locales/am/common.json";

export const resources = {
  en: {
    auth: authEn,
    attendance: attendanceEn,
    dashboard: dashboardEn,
    members: membersEn,
    common: commonEn,
  },
  am: {
    auth: authAm,
    attendance: attendanceAm,
    dashboard: dashboardAm,
    members: membersAm,
    common: commonAm,
  },
} as const;

export type AppLocales = keyof typeof resources; // "en" | "am"
export type DefaultNS = "common";
export type AppResources = (typeof resources)["en"];

// Strong TS types for t()
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: DefaultNS;
    resources: AppResources;
    returnNull: false;
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "am"],
    load: "languageOnly", // "en-US" -> "en"
    ns: ["common", "auth", "dashboard", "attendance", "members"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    returnNull: false,
    react: { useSuspense: false },
    detection: {
      // detector options (safe & simple)
      order: ["localStorage", "navigator", "htmlTag", "querystring"],
      caches: ["localStorage"],
      lookupLocalStorage: "lng",
      convertDetectedLanguage: (lng) => lng?.split?.("-")?.[0] ?? "en",
    },
    debug: import.meta.env.DEV,
  });

export default i18n;
