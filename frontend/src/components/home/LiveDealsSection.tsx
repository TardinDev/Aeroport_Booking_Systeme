import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

import { flightsApi } from "@/api/flights.api";
import { Reveal } from "@/components/ui/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDuration, formatTime } from "@/lib/utils";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import type { Flight } from "@/types";

/**
 * Live deals grid — a handful of the cheapest offers across
 * airlines and OTAs, refreshed on the server every 30 minutes.
 * Each card links directly to the seller's booking page.
 */
export function LiveDealsSection() {
  const { t } = useTranslation();
  const currency = useCurrencyStore((s) => s.code);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["flight-deals", 6],
    queryFn: () => flightsApi.getDeals(6),
    staleTime: 1000 * 60 * 10,
  });

  return (
    <section className="section bg-background">
      <div className="content-wide">
        <Reveal className="text-center">
          <h2 className="type-headline">{t("home.deals.title")}</h2>
          <p className="type-lede mx-auto mt-4 max-w-[40ch]">
            {t("home.deals.caption")}
          </p>
        </Reveal>

        <div className="mt-12">
          {isError ? (
            <p className="type-body text-center">{t("home.deals.error")}</p>
          ) : isLoading ? (
            <DealsSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {data?.map((flight) => (
                <DealCard key={flight.id} flight={flight} currency={currency} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DealCard({
  flight,
  currency,
}: {
  flight: Flight;
  currency: string;
}) {
  const { t } = useTranslation();
  const [sellerLogoFailed, setSellerLogoFailed] = useState(false);
  const href = flight.bookingUrl ?? "#";
  const stopsLabel =
    flight.stops === 0
      ? t("home.deals.direct")
      : flight.stops === 1
        ? t("home.deals.stopOne", { count: 1 })
        : t("home.deals.stopOther", { count: flight.stops });
  const sellerTypeLabel =
    flight.sellerType === "AIRLINE"
      ? t("home.deals.directAirline")
      : t("home.deals.viaAgency");

  return (
    <a
      href={href}
      target={href === "#" ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl bg-secondary p-7 transition-colors hover:bg-accent"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="type-caption">
            {flight.originCity} – {flight.destinationCity}
          </p>
          <p className="type-title mt-1">
            {flight.originCode} – {flight.destinationCode}
          </p>
        </div>
        {flight.sellerLogoUrl && !sellerLogoFailed ? (
          <img
            src={flight.sellerLogoUrl}
            alt={flight.sellerName ?? ""}
            loading="lazy"
            decoding="async"
            onError={() => setSellerLogoFailed(true)}
            className="h-6 w-auto max-w-[96px] object-contain"
          />
        ) : (
          <span className="type-caption">
            {flight.sellerName ?? flight.airlineName}
          </span>
        )}
      </div>

      <div className="mt-6 text-[15px] leading-snug text-muted-foreground">
        <p className="truncate text-foreground">
          {flight.airlineName} · {flight.flightNumber}
        </p>
        <p className="mt-1 tabular-nums">
          {formatTime(flight.departureTime)} – {formatTime(flight.arrivalTime)}
          {" · "}
          {formatDuration(flight.duration)}
        </p>
        <p className="mt-1">
          {stopsLabel} · {sellerTypeLabel}
        </p>
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div>
          <p className="type-caption">{t("home.deals.from")}</p>
          <p className="text-[28px] font-semibold leading-tight tracking-tight tabular-nums">
            {formatCurrency(Number(flight.basePrice), currency)}
          </p>
        </div>
        <span className="inline-flex items-center gap-0.5 text-[17px] text-link group-hover:underline">
          {t("home.deals.book")}
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </a>
  );
}

function DealsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-secondary p-7" aria-hidden>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-36" />
          <Skeleton className="mt-8 h-3 w-full" />
          <Skeleton className="mt-3 h-3 w-2/3" />
          <Skeleton className="mt-10 h-9 w-28" />
        </div>
      ))}
    </div>
  );
}
