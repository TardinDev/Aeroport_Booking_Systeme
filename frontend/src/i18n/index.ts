import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import fr from "@/i18n/locales/fr.json";
import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import zh from "@/i18n/locales/zh.json";

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
  zh: { translation: zh },
};

export const SUPPORTED_LANGUAGES = [
  { code: "fr", name: "Français", native: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", native: "Español", flag: "🇪🇸" },
  { code: "zh", name: "中文", native: "中文", flag: "🇨🇳" },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const LANGUAGE_CONFIRMED_KEY = "skybooker.language-confirmed";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["fr", "en", "es", "zh"],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

// Keep <html lang> in sync so the per-language font rules in index.css apply.
const syncDocumentLang = (lng: string) => {
  document.documentElement.lang = lng;
};
syncDocumentLang(i18n.resolvedLanguage ?? "en");
i18n.on("languageChanged", syncDocumentLang);

export default i18n;
