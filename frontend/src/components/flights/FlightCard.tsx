import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Clock, ExternalLink, Plane } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketStub } from "@/components/ui/ticket-stub";
import { DestinationPath } from "@/components/ui/destination-path";
import { formatCurrency, formatDuration, formatTime } from "@/lib/utils";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import type { Flight } from "@/types";

interface FlightCardProps {
  flight: Flight;
  /** Optional fallback for internal flows (kept for back-compat). */
  onSelect?: (flight: Flight) => void;
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  const { t } = useTranslation();
  const [airlineLogoFailed, setAirlineLogoFailed] = useState(false);
  const [sellerLogoFailed, setSellerLogoFailed] = useState(false);
  // Display price in the user's selected currency. The backend
  // stores fares in EUR — we convert at render time.
  const currency = useCurrencyStore((s) => s.code);

  const getStatusVariant = (
    status: Flight["status"]
  ): "default" | "secondary" | "destructive" | "success" | "warning" => {
    switch (status) {
      case "SCHEDULED":
        return "default";
      case "DELAYED":
        return "warning";
      case "CANCELLED":
        return "destructive";
      case "BOARDING":
        return "success";
      case "IN_FLIGHT":
        return "secondary";
      case "LANDED":
        return "success";
      default:
        return "default";
    }
  };

  const handleBook = () => {
    if (flight.bookingUrl) {
      window.open(flight.bookingUrl, "_blank", "noopener,noreferrer");
      return;
    }
    onSelect?.(flight);
  };

  const sellerLabel = flight.sellerName ?? flight.airlineName;
  const sellerIsAgency = flight.sellerType === "AGENCY";
  const sellerLogo = flight.sellerLogoUrl ?? flight.airlineLogo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <TicketStub
        perforationAt={76}
        className="bg-card transition-shadow duration-300 group-hover:shadow-[8px_8px_0_0_var(--coral)]"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto]">
          {/* Main stub — flight details */}
          <div className="p-6 md:p-8">
            {/* Header row */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-paper p-1">
                  {flight.airlineLogo && !airlineLogoFailed ? (
                    <img
                      src={flight.airlineLogo}
                      alt={flight.airlineName}
                      loading="lazy"
                      decoding="async"
                      onError={() => setAirlineLogoFailed(true)}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Plane className="h-5 w-5 text-ink" />
                  )}
                </div>
                <div>
                  <p className="display-serif text-xl leading-tight">
                    {flight.airlineName}
                  </p>
                  <p className="font-mono text-xs text-ink-faded">
                    {flight.flightNumber}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <Badge
                  variant={getStatusVariant(flight.status)}
                  className="small-caps rounded-none border-2 border-ink"
                >
                  {t(`flight.status.${flight.status}`)}
                </Badge>
                {flight.availableSeats <= 10 && (
                  <p className="mt-1 editorial-italic text-xs text-postmark">
                    {flight.availableSeats} {t("flight.card.seatsLeft")}
                  </p>
                )}
              </div>
            </div>

            {/* Route — editorial style */}
            <div className="grid grid-cols-[auto_1fr_auto] items-end gap-4">
              {/* Departure */}
              <div>
                <p className="small-caps text-ink-faded">Departure</p>
                <p className="display-serif text-5xl leading-none tabular">
                  {formatTime(flight.departureTime)}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold">
                  {flight.originCode}
                </p>
                <p className="text-xs text-ink-faded">{flight.originCity}</p>
              </div>

              {/* Middle — path + duration */}
              <div className="flex flex-col items-center px-4">
                <p className="small-caps mb-1 flex items-center gap-1 text-ink-faded">
                  <Clock className="h-3 w-3" />
                  <span className="tabular">
                    {formatDuration(flight.duration)}
                  </span>
                </p>
                <DestinationPath
                  className="h-12 w-full text-coral transition-colors group-hover:text-ink"
                  arc={0.4}
                />
                <p className="mt-1 editorial-italic text-xs text-ink-faded">
                  {flight.stops === 0
                    ? t("flight.card.direct")
                    : `${flight.stops} ${flight.stops === 1 ? t("flight.card.stop") : t("flight.card.stops")}`}
                </p>
              </div>

              {/* Arrival */}
              <div className="text-right">
                <p className="small-caps text-ink-faded">Arrival</p>
                <p className="display-serif text-5xl leading-none tabular">
                  {formatTime(flight.arrivalTime)}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold">
                  {flight.destinationCode}
                </p>
                <p className="text-xs text-ink-faded">
                  {flight.destinationCity}
                </p>
              </div>
            </div>

            {/* Footer row — class + seller + book button */}
            <div className="rule-top mt-6 flex flex-wrap items-center justify-between gap-3 pt-4">
              <div className="flex items-center gap-3">
                <span className="small-caps text-ink-faded">
                  Class · {t(`flight.class.${flight.seatClass}`)}
                </span>
                {sellerLabel && (
                  <>
                    <span className="h-4 w-px bg-ink/30" />
                    <span className="small-caps flex items-center gap-1.5 text-ink-faded">
                      Sold by{" "}
                      {sellerLogo && !sellerLogoFailed && (
                        <img
                          src={sellerLogo}
                          alt={sellerLabel}
                          loading="lazy"
                          decoding="async"
                          onError={() => setSellerLogoFailed(true)}
                          className="h-4 w-auto max-w-[4rem] object-contain"
                        />
                      )}
                      <span
                        className={
                          sellerIsAgency ? "text-coral" : "text-ink"
                        }
                      >
                        {sellerLabel}
                      </span>
                    </span>
                  </>
                )}
              </div>

              <Button
                onClick={handleBook}
                className="small-caps rounded-none border-2 border-ink bg-ink text-paper shadow-[3px_3px_0_0_var(--coral)] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_var(--coral)]"
              >
                {flight.bookingUrl
                  ? t("flight.card.bookOnSeller", {
                      seller: sellerLabel,
                      defaultValue: `Book on ${sellerLabel} →`,
                    })
                  : t("flight.card.selectFlight")}
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Tear-off stub — price */}
          <div className="flex flex-row items-center justify-between gap-4 border-t-2 border-dashed border-ink bg-ink p-6 text-paper md:min-w-[180px] md:flex-col md:items-end md:justify-center md:border-l-2 md:border-t-0 md:p-8">
            <div className="md:text-right">
              <p className="small-caps text-paper/60">Price · per person</p>
              <p className="display-serif text-4xl leading-none">
                {formatCurrency(flight.basePrice, currency)}
              </p>
            </div>
            <p className="editorial-italic text-xs text-paper/60 md:mt-4">
              Taxes & fees included
            </p>
          </div>
        </div>
      </TicketStub>
    </motion.div>
  );
}
