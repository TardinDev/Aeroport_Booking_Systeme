import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_CONFIRMED_KEY,
  type SupportedLanguageCode,
} from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * First-visit language chooser. Mounts once per session; displays a
 * centred modal with the four supported languages and their flags.
 * Writes a confirmation flag to localStorage so it never shows again
 * unless the user clears storage.
 */
export function LanguagePicker() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SupportedLanguageCode>(
    (i18n.resolvedLanguage as SupportedLanguageCode) ?? "en"
  );

  useEffect(() => {
    // Show only if the user has never explicitly confirmed a language.
    // Run after mount to avoid SSR-style mismatch with i18next detector.
    const confirmed = localStorage.getItem(LANGUAGE_CONFIRMED_KEY);
    if (!confirmed) setOpen(true);
  }, []);

  // Lock body scroll while the picker is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleConfirm = async () => {
    await i18n.changeLanguage(selected);
    localStorage.setItem(LANGUAGE_CONFIRMED_KEY, selected);
    setOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(
      LANGUAGE_CONFIRMED_KEY,
      (i18n.resolvedLanguage as string) ?? "en"
    );
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="language-picker-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="paper-bg grain relative w-full max-w-xl border-2 border-ink shadow-[10px_10px_0_0_var(--coral)]"
          >
            {/* Corner stamp */}
            <div className="absolute -right-2 -top-2 rotate-6 border-2 border-ink bg-paper px-3 py-1.5">
              <span className="small-caps text-[10px] text-coral">
                {t("language.picker.eyebrow")}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              aria-label={t("common.close")}
              className="absolute right-4 top-4 rounded-full border border-ink/30 bg-paper p-1.5 text-ink-faded hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="px-8 pb-8 pt-10 sm:px-10">
              <p className="small-caps text-coral">
                {t("language.picker.eyebrow")}
              </p>
              <h2
                id="language-picker-title"
                className="display-serif mt-2 text-4xl leading-[0.95] sm:text-5xl"
              >
                {t("language.picker.title")}
              </h2>
              <p className="body-serif mt-3 text-pretty text-ink-soft">
                {t("language.picker.subtitle")}
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const active = selected === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelected(lang.code)}
                      aria-pressed={active}
                      className={cn(
                        "group flex items-center gap-4 border-2 px-4 py-3 text-left transition-all",
                        active
                          ? "border-ink bg-ink text-paper shadow-[4px_4px_0_0_var(--coral)]"
                          : "border-ink/40 bg-paper hover:border-ink hover:shadow-[3px_3px_0_0_var(--ink)]"
                      )}
                    >
                      <span
                        className="text-3xl leading-none"
                        aria-hidden="true"
                      >
                        {lang.flag}
                      </span>
                      <span className="flex-1">
                        <span className="display-serif block text-lg leading-none">
                          {lang.native}
                        </span>
                        <span
                          className={cn(
                            "mt-1 block text-xs uppercase tracking-wider",
                            active ? "text-paper/70" : "text-ink-faded"
                          )}
                        >
                          {lang.code}
                        </span>
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="small-caps text-sm text-ink-faded underline-offset-4 hover:text-ink hover:underline"
                >
                  {t("language.picker.skip")}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="small-caps border-2 border-ink bg-ink px-6 py-3 text-paper shadow-[4px_4px_0_0_var(--coral)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--coral)]"
                >
                  {t("language.picker.continue")} →
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
