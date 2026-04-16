import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Globe } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_CONFIRMED_KEY,
  type SupportedLanguageCode,
} from "@/i18n";
import { cn } from "@/lib/utils";

interface LanguageMenuProps {
  /** Compact variant for the desktop header (flag + code). */
  compact?: boolean;
  className?: string;
}

export function LanguageMenu({ compact = false, className }: LanguageMenuProps) {
  const { i18n, t } = useTranslation();
  const current =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ??
    SUPPORTED_LANGUAGES[1];

  const handleSelect = async (code: SupportedLanguageCode) => {
    await i18n.changeLanguage(code);
    localStorage.setItem(LANGUAGE_CONFIRMED_KEY, code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("language.picker.menuLabel")}
          className={cn(
            "small-caps flex items-center gap-2 rounded-none px-2.5 py-2 text-ink transition-colors hover:bg-ink/5",
            className
          )}
        >
          {compact ? (
            <>
              <span className="text-base leading-none" aria-hidden="true">
                {current.flag}
              </span>
              <span className="text-[11px] uppercase">{current.code}</span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              <span className="text-base leading-none" aria-hidden="true">
                {current.flag}
              </span>
              <span>{current.native}</span>
            </>
          )}
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-none border-2 border-ink shadow-[4px_4px_0_0_var(--ink)]"
      >
        <DropdownMenuLabel className="small-caps text-ink-faded">
          {t("language.picker.menuLabel")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-ink/30" />
        {SUPPORTED_LANGUAGES.map((lang) => {
          const active = current.code === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="flex items-center gap-3 rounded-none"
            >
              <span className="text-lg leading-none" aria-hidden="true">
                {lang.flag}
              </span>
              <span className="flex-1">
                <span className="display-serif block text-base leading-none">
                  {lang.native}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-ink-faded">
                  {lang.code}
                </span>
              </span>
              {active && <Check className="h-3.5 w-3.5 text-coral" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
