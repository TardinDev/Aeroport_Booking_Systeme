import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getCurrencyEntry } from "@/stores/useCurrencyStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an EUR-denominated amount in a target currency, performing
 * static FX conversion via the currency catalogue. The amount passed
 * in MUST be in EUR — call sites should not pre-convert.
 */
export function formatCurrency(amountEur: number, currency: string = "EUR"): string {
  const entry = getCurrencyEntry(currency);
  const converted = amountEur * entry.rateFromEur;
  // Whole-number currencies (JPY, XAF, XOF) drop their decimals.
  const noDecimals = entry.code === "JPY" || entry.code === "XAF" || entry.code === "XOF";
  return new Intl.NumberFormat(entry.locale, {
    style: "currency",
    currency: entry.code,
    minimumFractionDigits: noDecimals ? 0 : 2,
    maximumFractionDigits: noDecimals ? 0 : 2,
  }).format(converted);
}

export function formatDate(date: string, locale: string = "fr-FR"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: string, locale: string = "fr-FR"): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
}

export function generateBookingRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
