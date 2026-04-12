import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Car,
  KeyRound,
  MapPin,
  Plane,
  Search,
  Star,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TicketStub } from "@/components/ui/ticket-stub";
import { Postmark } from "@/components/ui/postmark";
import { formatCurrency, cn } from "@/lib/utils";
import { searchAirports, type AirportEntry } from "@/lib/airports";
import { generateGroundTransportOffers } from "@/lib/ground-transport-mock";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import type {
  GroundTransportKind,
  GroundTransportOffer,
  GroundTransportSearchParams,
} from "@/types";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * /transport — standalone ground-transport page. Lets travellers
 * book a taxi pickup at any airport, or rent a car, without going
 * through a flight booking. Mirrors the editorial UX of /flights.
 */
export function GroundTransportPage() {
  const { t } = useTranslation();
  const currency = useCurrencyStore((s) => s.code);

  const [kind, setKind] = useState<GroundTransportKind>("TAXI_PICKUP");
  const [searchParams, setSearchParams] = useState<GroundTransportSearchParams | null>(
    null
  );

  const offers = useMemo(
    () => (searchParams ? generateGroundTransportOffers(searchParams) : []),
    [searchParams]
  );

  return (
    <div className="paper-bg min-h-screen">
      {/* Editorial masthead */}
      <section className="container mx-auto px-6 pt-12 pb-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="small-caps text-ink-faded">
            {t("transport.eyebrow", {
              defaultValue: "Door-to-door · without a flight",
            })}
          </p>
          <h1 className="display-serif text-5xl md:text-6xl mt-3 leading-[0.95]">
            {t("transport.title", {
              defaultValue: "On the ground, on your terms",
            })}
          </h1>
          <p className="editorial-italic mt-5 text-lg text-ink-faded">
            {t("transport.subtitle", {
              defaultValue:
                "Book a driver waiting at any airport with your name on a placard, or grab a rental car and head wherever the road takes you. No flight required.",
            })}
          </p>
        </div>

        {/* Mode toggle — TAXI / RENTAL */}
        <div className="mt-8 flex items-center justify-center">
          <div className="inline-flex border-2 border-ink bg-paper">
            <ModeButton
              active={kind === "TAXI_PICKUP"}
              onClick={() => setKind("TAXI_PICKUP")}
              icon={<Plane className="h-4 w-4" />}
              label={t("transport.modes.taxi", {
                defaultValue: "Airport pickup",
              })}
            />
            <ModeButton
              active={kind === "CAR_RENTAL"}
              onClick={() => setKind("CAR_RENTAL")}
              icon={<KeyRound className="h-4 w-4" />}
              label={t("transport.modes.rental", {
                defaultValue: "Rent a car",
              })}
            />
          </div>
        </div>

        {/* Search form */}
        <div className="mt-8 max-w-4xl mx-auto">
          <TransportSearchForm
            kind={kind}
            onSearch={setSearchParams}
            defaultValues={searchParams ?? undefined}
          />
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-6 pb-20">
        {!searchParams && <EmptyState kind={kind} />}

        {searchParams && offers.length === 0 && (
          <div className="text-center py-16">
            <p className="display-serif text-2xl">
              {t("transport.results.none", {
                defaultValue: "No offers for that airport — try another.",
              })}
            </p>
          </div>
        )}

        {searchParams && offers.length > 0 && (
          <>
            <div className="rule-top pt-6 mb-6 flex items-baseline justify-between">
              <p className="small-caps text-ink-faded">
                {kind === "TAXI_PICKUP"
                  ? t("transport.results.taxiHeader", {
                      defaultValue: "Drivers available",
                    })
                  : t("transport.results.rentalHeader", {
                      defaultValue: "Rental cars at",
                    })}{" "}
                · {searchParams.airport.toUpperCase()}
              </p>
              <p className="editorial-italic text-ink-faded">
                {t("transport.results.count", {
                  count: offers.length,
                  defaultValue: "{{count}} offer(s)",
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {offers.map((offer, idx) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <TransportOfferCard offer={offer} currency={currency} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode toggle button
// ---------------------------------------------------------------------------

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "small-caps inline-flex items-center gap-2 px-6 py-3 transition-all",
        active
          ? "bg-ink text-paper"
          : "bg-paper text-ink hover:bg-ink/5"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Search form
// ---------------------------------------------------------------------------

interface TransportSearchFormProps {
  kind: GroundTransportKind;
  onSearch: (params: GroundTransportSearchParams) => void;
  defaultValues?: GroundTransportSearchParams;
}

function TransportSearchForm({
  kind,
  onSearch,
  defaultValues,
}: TransportSearchFormProps) {
  const { t } = useTranslation();

  const [airport, setAirport] = useState(defaultValues?.airport ?? "");
  const [pickupDate, setPickupDate] = useState(defaultValues?.pickupDate ?? "");
  const [returnDate, setReturnDate] = useState(defaultValues?.returnDate ?? "");
  const [passengers, setPassengers] = useState(defaultValues?.passengers ?? 1);
  const [airportOpen, setAirportOpen] = useState(false);
  const airportRef = useRef<HTMLDivElement>(null);

  const airportSuggestions = useMemo(
    () => searchAirports(airport, 6),
    [airport]
  );

  // Click-outside to close airport dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (airportRef.current && !airportRef.current.contains(e.target as Node)) {
        setAirportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!airport || !pickupDate) return;
    onSearch({
      kind,
      airport,
      pickupDate,
      returnDate: kind === "CAR_RENTAL" ? returnDate : undefined,
      passengers,
    });
  };

  const pickAirport = (entry: AirportEntry) => {
    setAirport(entry.iata);
    setAirportOpen(false);
  };

  return (
    <TicketStub perforationAt={68} className="bg-card">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-0"
      >
        <div className="p-6 md:p-8 space-y-5">
          {/* Airport autocomplete */}
          <div ref={airportRef} className="relative">
            <Label className="small-caps text-ink-faded">
              {kind === "TAXI_PICKUP"
                ? t("transport.form.pickupAirport", {
                    defaultValue: "Pickup airport",
                  })
                : t("transport.form.rentalAirport", {
                    defaultValue: "Rental location · airport",
                  })}
            </Label>
            <div className="relative mt-1">
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faded" />
              <Input
                value={airport}
                onChange={(e) => {
                  setAirport(e.target.value);
                  setAirportOpen(true);
                }}
                onFocus={() => setAirportOpen(true)}
                placeholder="CDG, JFK, NRT…"
                className="rounded-none border-2 border-ink pl-9 font-mono uppercase"
              />
            </div>

            <AnimatePresence>
              {airportOpen && airportSuggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-30 mt-1 w-full border-2 border-ink bg-paper shadow-[4px_4px_0_0_var(--ink)] max-h-72 overflow-auto"
                >
                  {airportSuggestions.map((s) => (
                    <li key={s.iata}>
                      <button
                        type="button"
                        onClick={() => pickAirport(s)}
                        className="w-full text-left px-4 py-2 hover:bg-ink/5 border-b border-ink/10 last:border-b-0"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="display-serif text-base">
                              {s.city}
                            </p>
                            <p className="text-xs text-ink-faded">
                              {s.airportName}
                            </p>
                          </div>
                          <span className="font-mono text-sm font-semibold">
                            {s.iata}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Date fields */}
          <div
            className={cn(
              "grid gap-4",
              kind === "CAR_RENTAL"
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1"
            )}
          >
            <div>
              <Label className="small-caps text-ink-faded">
                {kind === "TAXI_PICKUP"
                  ? t("transport.form.pickupDate", {
                      defaultValue: "Pickup date",
                    })
                  : t("transport.form.rentalPickupDate", {
                      defaultValue: "Rental start",
                    })}
              </Label>
              <div className="relative mt-1">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faded" />
                <Input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="rounded-none border-2 border-ink pl-9"
                />
              </div>
            </div>

            {kind === "CAR_RENTAL" && (
              <div>
                <Label className="small-caps text-ink-faded">
                  {t("transport.form.returnDate", {
                    defaultValue: "Return date",
                  })}
                </Label>
                <div className="relative mt-1">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faded" />
                  <Input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="rounded-none border-2 border-ink pl-9"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Passengers */}
          <div>
            <Label className="small-caps text-ink-faded">
              {t("transport.form.passengers", {
                defaultValue: "Travellers",
              })}
            </Label>
            <div className="relative mt-1">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faded" />
              <Input
                type="number"
                min={1}
                max={9}
                value={passengers}
                onChange={(e) =>
                  setPassengers(Math.max(1, Math.min(9, Number(e.target.value))))
                }
                className="rounded-none border-2 border-ink pl-9"
              />
            </div>
          </div>
        </div>

        {/* Submit stub */}
        <div className="flex flex-row items-center justify-between gap-4 border-t-2 border-dashed border-ink bg-ink p-6 text-paper md:min-w-[200px] md:flex-col md:items-stretch md:justify-center md:border-l-2 md:border-t-0 md:p-8">
          <p className="small-caps text-paper/60">
            {t("transport.form.ready", { defaultValue: "Ready to roll" })}
          </p>
          <Button
            type="submit"
            className="small-caps rounded-none border-2 border-paper bg-paper text-ink shadow-[3px_3px_0_0_var(--coral)] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_var(--coral)]"
          >
            <Search className="mr-2 h-4 w-4" />
            {t("transport.form.search", {
              defaultValue: "Search",
            })}
          </Button>
        </div>
      </form>
    </TicketStub>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ kind }: { kind: GroundTransportKind }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rule-top mt-2 pt-12 text-center"
    >
      <div className="inline-flex h-16 w-16 items-center justify-center border-2 border-ink bg-paper">
        {kind === "TAXI_PICKUP" ? (
          <Car className="h-7 w-7 text-ink" />
        ) : (
          <KeyRound className="h-7 w-7 text-ink" />
        )}
      </div>
      <p className="display-serif text-3xl mt-4">
        {kind === "TAXI_PICKUP"
          ? t("transport.empty.taxi", {
              defaultValue: "Tell us where to meet you.",
            })
          : t("transport.empty.rental", {
              defaultValue: "Tell us where you're landing.",
            })}
      </p>
      <p className="editorial-italic text-ink-faded mt-2">
        {t("transport.empty.helper", {
          defaultValue: "Pick an airport above to see live offers.",
        })}
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Offer card
// ---------------------------------------------------------------------------

function TransportOfferCard({
  offer,
  currency,
}: {
  offer: GroundTransportOffer;
  currency: string;
}) {
  const { t } = useTranslation();
  const isTaxi = offer.kind === "TAXI_PICKUP";

  return (
    <motion.div whileHover={{ y: -4 }} className="group">
      <TicketStub
        perforationAt={70}
        className="bg-card transition-shadow duration-300 group-hover:shadow-[8px_8px_0_0_var(--coral)]"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto]">
          {/* Main stub */}
          <div className="p-6 md:p-8 relative">
            {isTaxi && (
              <div className="absolute top-4 right-4">
                <Postmark
                  label={t("transport.card.placard", {
                    defaultValue: "With placard",
                  })}
                />
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-paper text-xl">
                {offer.providerLogo ?? (isTaxi ? "🚖" : "🚗")}
              </div>
              <div>
                <p className="display-serif text-2xl leading-tight">
                  {offer.providerName}
                </p>
                <p className="font-mono text-xs text-ink-faded">
                  {offer.airportCode} · {offer.airportCity},{" "}
                  {offer.airportCountry}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="small-caps text-ink-faded">
                {isTaxi
                  ? t("transport.card.vehicle", {
                      defaultValue: "Vehicle",
                    })
                  : t("transport.card.car", { defaultValue: "Car" })}
              </p>
              <p className="display-serif text-xl mt-1">
                {offer.vehicleLabel}
              </p>
              <p className="text-xs text-ink-faded mt-1 flex items-center gap-1">
                <Users className="h-3 w-3" />
                {t("transport.card.capacity", {
                  count: offer.capacity,
                  defaultValue: "Up to {{count}} pax",
                })}
              </p>
            </div>

            {/* Highlights */}
            <ul className="mt-4 space-y-1.5">
              {offer.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 text-sm text-ink"
                >
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-coral" />
                  {h}
                </li>
              ))}
            </ul>

            {/* Rating */}
            <div className="rule-top mt-5 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-coral text-coral" />
                <span className="font-mono font-semibold">
                  {offer.rating.toFixed(1)}
                </span>
                <span className="text-ink-faded">/ 5</span>
              </div>
              <p className="editorial-italic text-xs text-ink-faded">
                <MapPin className="inline h-3 w-3 mr-1" />
                {offer.airportCode}
              </p>
            </div>
          </div>

          {/* Price stub */}
          <div className="flex flex-row items-center justify-between gap-4 border-t-2 border-dashed border-ink bg-ink p-6 text-paper md:min-w-[180px] md:flex-col md:items-end md:justify-center md:border-l-2 md:border-t-0 md:p-8">
            <div className="md:text-right">
              <p className="small-caps text-paper/60">
                {isTaxi
                  ? t("transport.card.flatFare", {
                      defaultValue: "Flat fare",
                    })
                  : t("transport.card.perDay", {
                      defaultValue: "Per day",
                    })}
              </p>
              <p className="display-serif text-3xl leading-none mt-1">
                {formatCurrency(offer.priceEur, currency)}
              </p>
            </div>
            <Button className="small-caps rounded-none border-2 border-paper bg-paper text-ink shadow-[3px_3px_0_0_var(--coral)] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_var(--coral)] md:mt-4 md:w-full">
              {t("transport.card.book", { defaultValue: "Book" })}
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </TicketStub>
    </motion.div>
  );
}
