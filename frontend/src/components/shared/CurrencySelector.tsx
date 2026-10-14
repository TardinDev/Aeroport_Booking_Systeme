import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CURRENCIES, useCurrencyStore } from "@/stores/useCurrencyStore";
import { cn } from "@/lib/utils";

interface CurrencySelectorProps {
  className?: string;
}

/**
 * CurrencySelector — small dropdown that lets the visitor pick the
 * currency in which all prices on Fly and Taxi are displayed. The
 * choice is persisted in localStorage via useCurrencyStore.
 */
export function CurrencySelector({ className }: CurrencySelectorProps) {
  const { t } = useTranslation();
  const code = useCurrencyStore((s) => s.code);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const current = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("common.currencyLabel")}
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[13px] text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground",
            className
          )}
        >
          <span>{current.code}</span>
          <span aria-hidden="true">{current.symbol}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-96 w-64 overflow-y-auto">
        <DropdownMenuLabel className="type-caption font-normal">
          {t("common.currencyLabel")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CURRENCIES.map((c) => {
          const active = c.code === code;
          return (
            <DropdownMenuItem
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className="flex items-center justify-between gap-3"
            >
              <span className="flex items-center gap-3">
                <span className="w-9 font-medium tabular-nums">{c.code}</span>
                <span className="text-muted-foreground">{c.label}</span>
              </span>
              {active ? (
                <Check className="text-link" />
              ) : (
                <span className="text-muted-foreground">{c.symbol}</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
