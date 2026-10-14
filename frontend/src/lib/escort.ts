/** Protection levels of the escort service, shared by the home teaser and the escort page. */
export const ESCORT_TIERS = [
  { id: "silver", grade: "Argent", hourlyEur: 450 },
  { id: "diamond", grade: "Diamant", hourlyEur: 1200 },
  { id: "obsidian", grade: "Obsidienne", hourlyEur: null },
] as const;

export type EscortTierId = (typeof ESCORT_TIERS)[number]["id"];

export const DEFAULT_ESCORT_TIER: EscortTierId = "diamond";
