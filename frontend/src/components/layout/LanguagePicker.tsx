import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_CONFIRMED_KEY,
  type SupportedLanguageCode,
} from "@/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * First-visit language chooser. Mounts once per session; displays a
 * centred modal with the four supported languages and their flags.
 * Writes a confirmation flag to localStorage so it never shows again
 * unless the user clears storage.
 */
export function LanguagePicker() {
  const { i18n, t } = useTranslation();
  // Show only if the user has never explicitly confirmed a language.
  const [open, setOpen] = useState(
    () => !localStorage.getItem(LANGUAGE_CONFIRMED_KEY)
  );
  const [selected, setSelected] = useState<SupportedLanguageCode>(
    (i18n.resolvedLanguage as SupportedLanguageCode) ?? "en"
  );

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-md rounded-3xl bg-background p-8 shadow-modal sm:p-10"
          >
            <button
              type="button"
              onClick={handleSkip}
              aria-label={t("common.close")}
              className="absolute right-4 top-4 rounded-full bg-secondary p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 id="language-picker-title" className="type-title pr-8">
              {t("language.picker.title")}
            </h2>
            <p className="mt-2 text-[15px] text-muted-foreground">
              {t("language.picker.subtitle")}
            </p>

            <div className="mt-6 space-y-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const active = selected === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    lang={lang.code}
                    onClick={() => setSelected(lang.code)}
                    aria-pressed={active}
                    className={cn(
                      "flex h-[52px] w-full items-center justify-between rounded-md border px-4 text-left transition-colors",
                      active
                        ? "border-link ring-1 ring-link"
                        : "border-border hover:border-input"
                    )}
                  >
                    {lang.native}
                    {active && <Check className="h-4 w-4 text-link" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleSkip}
                className="text-[15px] text-link hover:underline"
              >
                {t("language.picker.skip")}
              </button>
              <Button onClick={handleConfirm}>
                {t("language.picker.continue")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
