import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plane } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDuration, formatTime } from "@/lib/utils";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import type { Flight } from "@/types";

interface FlightCardProps {
  flight: Flight;
  /** Optional fallback for internal flows (kept for back-compat). */
  onSelect?: (flight: Flight) => void;
}

const STATUS_VARIANTS: Record<
  Flight["status"],
  "default" | "secondary" | "destructive" | "success" | "warning"
> = {
  SCHEDULED: "secondary",
  DELAYED: "warning",
  CANCELLED: "destructive",
  BOARDING: "success",
  IN_FLIGHT: "default",
  LANDED: "success",
};

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  const { t } = useTranslation();
  const [airlineLogoFailed, setAirlineLogoFailed] = useState(false);
  // Display price in the user's selected currency. The backend
  // stores fares in EUR — we convert at render time.
  const currency = useCurrencyStore((s) => s.code);

  const handleBook = () => {
    if (flight.bookingUrl) {
      window.open(flight.bookingUrl, "_blank", "noopener,noreferrer");
      return;
    }
    onSelect?.(flight);
  };

  const sellerLabel = flight.sellerName ?? flight.airlineName;
  const stopsLabel =
    flight.stops === 0
      ? t("flight.card.direct")
      : `${flight.stops} ${flight.stops === 1 ? t("flight.card.stop") : t("flight.card.stops")}`;

  return (
    <article className="rounded-xl bg-card p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center">
            {flight.airlineLogo && !airlineLogoFailed ? (
              <img
                src={flight.airlineLogo}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setAirlineLogoFailed(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <Plane className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <p className="truncate text-[15px]">
            {flight.airlineName}
            <span className="text-muted-foreground"> · {flight.flightNumber}</span>
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[flight.status] ?? "secondary"}>
          {t(`flight.status.${flight.status}`)}
        </Badge>
      </div>

      <div className="mt-6 grid grid-cols-1 items-end gap-6 md:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <div>
            <p className="text-[28px] font-semibold leading-none tracking-tight tabular-nums md:text-[32px]">
              {formatTime(flight.departureTime)}
            </p>
            <p className="mt-2 text-[15px] leading-tight">
              {flight.originCode}
              <span className="text-muted-foreground"> {flight.originCity}</span>
            </p>
          </div>

          <div className="text-center">
            <p className="type-caption tabular-nums">
              {formatDuration(flight.duration)}
            </p>
            <div className="my-1.5 h-px bg-border" />
            <p className="type-caption">{stopsLabel}</p>
          </div>

          <div className="text-right">
            <p className="text-[28px] font-semibold leading-none tracking-tight tabular-nums md:text-[32px]">
              {formatTime(flight.arrivalTime)}
            </p>
            <p className="mt-2 text-[15px] leading-tight">
              {flight.destinationCode}
              <span className="text-muted-foreground"> {flight.destinationCity}</span>
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-6 border-t border-border pt-5 md:block md:border-l md:border-t-0 md:pl-8 md:pt-0 md:text-right">
          <div>
            <p className="text-[28px] font-semibold leading-none tracking-tight tabular-nums">
              {formatCurrency(flight.basePrice, currency)}
            </p>
            <p className="type-caption mt-1.5">
              {t("flight.card.perPerson")} · {t("flight.card.taxesIncluded")}
            </p>
          </div>
          <Button onClick={handleBook} className="md:mt-4">
            {flight.bookingUrl
              ? t("flight.card.bookOnSeller", { seller: sellerLabel })
              : t("flight.card.selectFlight")}
          </Button>
        </div>
      </div>

      <p className="type-caption mt-5">
        {t(`flight.class.${flight.seatClass}`)}
        {flight.bookingUrl && sellerLabel && (
          <>
            {" · "}
            {t("flight.card.soldBy")} {sellerLabel}
          </>
        )}
        {flight.availableSeats <= 10 && (
          <span className="text-warning">
            {" · "}
            {flight.availableSeats} {t("flight.card.seatsLeft")}
          </span>
        )}
      </p>
    </article>
  );
}
