import { useTranslation } from "react-i18next";
import { Check, Globe } from "lucide-react";

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
  /** Compact variant for the desktop header (language code only). */
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
            "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground",
            className
          )}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{compact ? current.code.toUpperCase() : current.native}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="type-caption font-normal">
          {t("language.picker.menuLabel")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            lang={lang.code}
            onClick={() => handleSelect(lang.code)}
            className="flex items-center justify-between gap-3"
          >
            {lang.native}
            {current.code === lang.code && <Check className="text-link" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
