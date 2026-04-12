import { Coins, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  /** Editorial = compact monospace pill matching the masthead. */
  variant?: "editorial" | "ghost";
  className?: string;
}

/**
 * CurrencySelector — small dropdown that lets the visitor pick the
 * currency in which all prices on Fly and Taxi are displayed. The
 * choice is persisted in localStorage via useCurrencyStore.
 */
export function CurrencySelector({
  variant = "editorial",
  className,
}: CurrencySelectorProps) {
  const code = useCurrencyStore((s) => s.code);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const current = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "editorial" ? "sm" : "icon"}
          className={cn(
            "small-caps gap-2 rounded-none text-ink hover:bg-ink/5",
            variant === "editorial" &&
              "border border-ink px-3 py-1 font-mono text-[0.7rem] tracking-wider",
            className
          )}
          aria-label="Switch currency"
        >
          <Coins className="h-3.5 w-3.5" />
          <span>{current.code}</span>
          <span className="text-ink-faded">{current.symbol}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 max-h-96 overflow-y-auto rounded-none border-2 border-ink shadow-[4px_4px_0_0_var(--ink)]"
      >
        <DropdownMenuLabel className="small-caps text-ink-faded">
          Display prices in
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-ink/30" />
        {CURRENCIES.map((c) => {
          const active = c.code === code;
          return (
            <DropdownMenuItem
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-none py-2",
                active && "bg-paper-deep"
              )}
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs tracking-wider text-ink">
                  {c.code}
                </span>
                <span className="text-sm text-ink-soft">{c.label}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink-faded">
                  {c.symbol}
                </span>
                {active && <Check className="h-3 w-3 text-coral" />}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
