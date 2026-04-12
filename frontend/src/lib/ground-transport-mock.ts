/**
 * Ground transport mock catalog — used by the standalone /transport
 * page until the backend exposes a real provider integration.
 *
 * Prices are in EUR (canonical). Daily rate for rentals, fixed fare
 * for taxi pickups. The frontend currency store handles conversion
 * to the user's chosen display currency.
 */

import type {
  GroundTransportKind,
  GroundTransportOffer,
  GroundTransportSearchParams,
} from "@/types";
import { AIRPORTS } from "@/lib/airports";

const TAXI_PROVIDERS = [
  { name: "BlackLane", logo: "🛎️" },
  { name: "Welcome Pickups", logo: "🪧" },
  { name: "Kiwitaxi", logo: "🚖" },
  { name: "Daytrip", logo: "🚐" },
];

const RENTAL_PROVIDERS = [
  { name: "Hertz", logo: "🅷" },
  { name: "Sixt", logo: "🅢" },
  { name: "Europcar", logo: "🅔" },
  { name: "Enterprise", logo: "🅴" },
];

const VEHICLES_TAXI = [
  { label: "Sedan · 1-3 pax", capacity: 3, base: 38 },
  { label: "Estate · 1-4 pax", capacity: 4, base: 46 },
  { label: "Van · 1-7 pax", capacity: 7, base: 78 },
  { label: "Executive · 1-3 pax", capacity: 3, base: 92 },
];

const VEHICLES_RENTAL = [
  { label: "Renault Clio (or similar)", capacity: 4, base: 32 },
  { label: "VW Polo (or similar)", capacity: 4, base: 36 },
  { label: "Peugeot 3008 (or similar)", capacity: 5, base: 58 },
  { label: "BMW Series 3 (or similar)", capacity: 5, base: 84 },
];

const TAXI_HIGHLIGHTS = [
  ["Driver waits with name placard", "Free 60 min wait", "Door-to-door"],
  ["Flight tracking", "English-speaking driver", "Child seat on request"],
  ["Free cancellation 24h", "Meet & greet", "All taxes included"],
];

const RENTAL_HIGHLIGHTS = [
  ["Unlimited mileage", "Full tank · full tank", "Free cancellation"],
  ["24/7 desk at terminal", "Theft protection", "Cross-border allowed"],
  ["Add-on GPS", "Winter tyres on request", "Roadside assistance"],
];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function findAirport(query: string) {
  if (!query) return null;
  const q = query.trim().toUpperCase();
  return (
    AIRPORTS.find(
      (a) =>
        a.iata.toUpperCase() === q ||
        a.city.toUpperCase().includes(q) ||
        a.airportName.toUpperCase().includes(q)
    ) ?? null
  );
}

/**
 * Generate a stable batch of mock offers for the given search.
 * Same input → same output, so the list doesn't shuffle on re-render.
 */
export function generateGroundTransportOffers(
  params: GroundTransportSearchParams
): GroundTransportOffer[] {
  const airport = findAirport(params.airport);
  if (!airport) return [];

  const isTaxi = params.kind === "TAXI_PICKUP";
  const providers = isTaxi ? TAXI_PROVIDERS : RENTAL_PROVIDERS;
  const vehicles = isTaxi ? VEHICLES_TAXI : VEHICLES_RENTAL;
  const highlights = isTaxi ? TAXI_HIGHLIGHTS : RENTAL_HIGHLIGHTS;

  // 6 offers — alternating providers and vehicles, deterministic
  // ordering by the airport IATA so re-renders are stable.
  const seed = airport.iata.charCodeAt(0) + airport.iata.charCodeAt(1);

  return Array.from({ length: 6 }, (_, idx) => {
    const provider = pick(providers, seed + idx);
    const vehicle = pick(vehicles, idx);
    const high = pick(highlights, idx);
    const passengerSurcharge = Math.max(0, params.passengers - vehicle.capacity) * 8;
    const ratingBase = 4.2 + ((seed + idx * 3) % 7) / 10;

    return {
      id: `${params.kind}-${airport.iata}-${idx}`,
      kind: params.kind as GroundTransportKind,
      providerName: provider.name,
      providerLogo: provider.logo,
      airportCode: airport.iata,
      airportCity: airport.city,
      airportCountry: airport.country,
      vehicleLabel: vehicle.label,
      capacity: vehicle.capacity,
      priceEur: vehicle.base + idx * 4 + passengerSurcharge,
      rating: Math.min(5, Math.round(ratingBase * 10) / 10),
      highlights: [...high],
    };
  });
}
