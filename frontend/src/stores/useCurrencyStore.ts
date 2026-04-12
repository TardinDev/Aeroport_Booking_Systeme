import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Currency catalogue used across Fly and Taxi.
 * Rates are quoted *per 1 EUR* (the canonical pricing currency).
 * Numbers are static demo rates — in production they would come from
 * a daily FX feed (ECB / openexchangerates / etc.).
 */
export interface CurrencyEntry {
  code: string;
  symbol: string;
  label: string;
  /** Locale used for Intl number formatting */
  locale: string;
  /** Multiplier to convert an EUR amount into this currency */
  rateFromEur: number;
}

export const CURRENCIES: CurrencyEntry[] = [
  { code: "EUR", symbol: "€", label: "Euro", locale: "fr-FR", rateFromEur: 1 },
  { code: "USD", symbol: "$", label: "US Dollar", locale: "en-US", rateFromEur: 1.08 },
  { code: "GBP", symbol: "£", label: "British Pound", locale: "en-GB", rateFromEur: 0.85 },
  { code: "CHF", symbol: "Fr", label: "Swiss Franc", locale: "de-CH", rateFromEur: 0.96 },
  { code: "JPY", symbol: "¥", label: "Japanese Yen", locale: "ja-JP", rateFromEur: 167 },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan", locale: "zh-CN", rateFromEur: 7.85 },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham", locale: "ar-AE", rateFromEur: 3.97 },
  { code: "MAD", symbol: "DH", label: "Moroccan Dirham", locale: "fr-MA", rateFromEur: 10.85 },
  { code: "XAF", symbol: "FCFA", label: "Central Africa CFA", locale: "fr-CM", rateFromEur: 655.957 },
  { code: "XOF", symbol: "CFA", label: "West Africa CFA", locale: "fr-SN", rateFromEur: 655.957 },
  { code: "BRL", symbol: "R$", label: "Brazilian Real", locale: "pt-BR", rateFromEur: 5.45 },
  { code: "INR", symbol: "₹", label: "Indian Rupee", locale: "en-IN", rateFromEur: 90.5 },
];

interface CurrencyState {
  code: string;
}

interface CurrencyActions {
  setCurrency: (code: string) => void;
}

type CurrencyStore = CurrencyState & CurrencyActions;

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      code: "EUR",
      setCurrency: (code: string) => set({ code }),
    }),
    {
      name: "fly-and-taxi-currency",
    }
  )
);

/** Look up a currency entry, falling back to EUR. */
export function getCurrencyEntry(code: string): CurrencyEntry {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
