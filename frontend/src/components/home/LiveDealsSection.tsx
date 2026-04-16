import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, Plane } from "lucide-react";

import { flightsApi } from "@/api/flights.api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDuration, formatTime } from "@/lib/utils";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import type { Flight } from "@/types";

/**
 * Live deals strip — a handful of the cheapest offers across
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
    <section className="border-t-2 border-ink py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="mb-12 flex flex-col items-baseline justify-between gap-4 sm:flex-row">
          <div className="max-w-2xl">
            <p className="small-caps mb-3 text-coral">
              {t("home.deals.eyebrow")}
            </p>
            <h2 className="display-serif text-5xl leading-[0.95] sm:text-6xl">
              {t("home.deals.titlePre")}{" "}
              <span className="display-serif-italic text-coral">
                {t("home.deals.titleItalic")}
              </span>{" "}
              {t("home.deals.titlePost")}
            </h2>
          </div>
          <p className="editorial-italic max-w-sm text-ink-faded">
            {t("home.deals.caption")}
          </p>
        </div>

        {isError ? (
          <div className="rule-top-thick border-ink/40 py-8">
            <p className="body-serif text-ink-faded">{t("home.deals.error")}</p>
          </div>
        ) : isLoading ? (
          <DealsSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data?.map((flight, i) => (
              <DealCard
                key={flight.id}
                flight={flight}
                index={i}
                currency={currency}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DealCard({
  flight,
  index,
  currency,
}: {
  flight: Flight;
  index: number;
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
    <motion.a
      href={href}
      target={href === "#" ? undefined : "_blank"}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.3) }}
      viewport={{ once: true, margin: "-10%" }}
      whileHover={{ y: -3 }}
      className="group relative block border-2 border-ink bg-paper p-6 shadow-[4px_4px_0_0_var(--ink)] transition-shadow hover:shadow-[8px_8px_0_0_var(--coral)]"
    >
      {/* Top row: route + seller chip */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="small-caps text-ink-faded">
            {flight.originCity} → {flight.destinationCity}
          </p>
          <p className="display-serif mt-1 text-3xl leading-none">
            {flight.originCode}{" "}
            <span className="text-coral">·</span> {flight.destinationCode}
          </p>
        </div>
        {flight.sellerLogoUrl && !sellerLogoFailed ? (
          <img
            src={flight.sellerLogoUrl}
            alt={flight.sellerName ?? ""}
            loading="lazy"
            decoding="async"
            onError={() => setSellerLogoFailed(true)}
            className="h-7 w-auto max-w-[110px] object-contain opacity-90"
          />
        ) : (
          <span className="small-caps text-xs text-ink-faded">
            {flight.sellerName ?? flight.airlineName}
          </span>
        )}
      </div>

      {/* Middle row: airline + timing */}
      <div className="flex items-center gap-3 border-y border-dashed border-ink/30 py-4">
        <Plane className="h-4 w-4 -rotate-45 text-ink-faded" />
        <div className="flex-1 min-w-0">
          <p className="truncate body-serif text-sm">{flight.airlineName}</p>
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faded">
            {flight.flightNumber} · {formatTime(flight.departureTime)} —{" "}
            {formatTime(flight.arrivalTime)}
          </p>
        </div>
        <p className="small-caps text-ink-faded">
          {formatDuration(flight.duration)}
        </p>
      </div>

      {/* Bottom row: price + CTA */}
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="small-caps text-ink-faded">{t("home.deals.from")}</p>
          <p className="display-serif text-4xl leading-none text-ink">
            {formatCurrency(Number(flight.basePrice), currency)}
          </p>
          <p className="editorial-italic mt-1 text-xs text-ink-faded">
            {stopsLabel} · {sellerTypeLabel}
          </p>
        </div>
        <span className="flex items-center gap-1 text-ink link-ink">
          <span className="small-caps">{t("home.deals.book")}</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </motion.a>
  );
}

function DealsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="border-2 border-ink/30 bg-paper p-6"
          aria-hidden
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-40" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="space-y-3 border-y border-dashed border-ink/20 py-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-10 w-28" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
