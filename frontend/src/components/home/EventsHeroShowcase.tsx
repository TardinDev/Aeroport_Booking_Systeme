import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { format, isSameDay, isToday, isTomorrow } from "date-fns";
import { enGB, es as esLocale, fr as frLocale, zhCN } from "date-fns/locale";
import type { Locale } from "date-fns";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Ticket,
} from "lucide-react";

import { destinationsApi } from "@/api/destinations.api";
import { Postmark } from "@/components/ui/postmark";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { cn, formatCurrency } from "@/lib/utils";
import type {
  DestinationEvent,
  DestinationEventsResponse,
  EventCategory,
} from "@/types";

interface EventsHeroShowcaseProps {
  iata: string;
  city: string;
}

const CATEGORY_TONE: Record<EventCategory, string> = {
  festival: "bg-coral text-paper",
  music: "bg-ink text-paper",
  sports: "bg-emerald-700 text-paper",
  cultural: "bg-gold text-ink",
  food: "bg-orange-600 text-paper",
  seasonal: "bg-postmark-red text-paper",
};

function pickLocale(lang: string | undefined): Locale {
  switch (lang) {
    case "fr":
      return frLocale;
    case "es":
      return esLocale;
    case "zh":
      return zhCN;
    default:
      return enGB;
  }
}

function toneFor(category: string): string {
  return (
    CATEGORY_TONE[category as EventCategory] ?? "bg-paper-deep text-ink"
  );
}

/**
 * EventsHeroShowcase — full-bleed hero banner + featured event + grid
 * of cards for a picked destination. Data comes from the backend
 * /destinations/{iata}/events endpoint.
 */
export function EventsHeroShowcase({ iata, city }: EventsHeroShowcaseProps) {
  const { t, i18n } = useTranslation();
  const currency = useCurrencyStore((s) => s.code);
  const locale = pickLocale(i18n.resolvedLanguage);

  const { data, isLoading, isError } = useQuery<DestinationEventsResponse>({
    queryKey: ["destination-events", iata],
    queryFn: () => destinationsApi.getEvents(iata),
    enabled: !!iata,
    staleTime: 1000 * 60 * 30,
  });

  if (isError) {
    return (
      <div className="border-2 border-dashed border-ink/40 bg-paper p-8 shadow-[4px_4px_0_0_var(--ink)]">
        <p className="small-caps mb-2 text-coral">{t("events.gate.eyebrow")}</p>
        <p className="body-serif text-ink-soft">{t("events.error")}</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return <ShowcaseSkeleton loadingLabel={t("events.loading")} />;
  }

  if (!data.events || data.events.length === 0) {
    return (
      <div className="border-2 border-ink bg-paper p-10 text-center shadow-[8px_8px_0_0_var(--ink)]">
        <p className="small-caps mb-3 text-coral">{t("events.gate.eyebrow")}</p>
        <h3 className="display-serif text-4xl leading-tight">
          {data.city || city}
        </h3>
        <p className="body-serif mt-4 text-ink-soft">{t("events.noEvents")}</p>
      </div>
    );
  }

  const featured =
    data.events.find((e) => e.featured) ?? data.events[0] ?? null;
  const rest = data.events.filter((e) => e !== featured);

  return (
    <div className="space-y-10">
      <HeroBanner data={data} />

      {featured && (
        <FeaturedEvent
          event={featured}
          currency={currency}
          locale={locale}
          t={t}
        />
      )}

      {rest.length > 0 && (
        <div>
          <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-ink/30 pb-3">
            <p className="small-caps text-coral">{t("events.upcoming")}</p>
            <span className="font-mono text-xs tracking-wider text-ink-faded">
              {rest.length.toString().padStart(2, "0")} ·{" "}
              {t("events.gate.eyebrow")}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                index={i}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Hero banner -----------------------------------------------------

function HeroBanner({ data }: { data: DestinationEventsResponse }) {
  const [failed, setFailed] = useState(false);
  const hasImage = !!data.heroImage?.url && !failed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden border-2 border-ink shadow-[8px_8px_0_0_var(--ink)]"
    >
      <div className="relative aspect-[21/9] w-full bg-ink">
        {hasImage && data.heroImage ? (
          <img
            src={data.heroImage.url}
            alt={data.heroImage.alt || data.city}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-navy to-coral" />
        )}
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />

        {/* Postmark top right */}
        <div className="pointer-events-none absolute right-4 top-4 z-10 sm:right-8 sm:top-8">
          <Postmark
            label="As seen this month"
            sublabel={data.iata}
            tone="red"
            rotate={-10}
            size="md"
          />
        </div>

        {/* City + country text */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-paper sm:p-10 lg:p-14">
          <p className="font-mono text-xs tracking-[0.3em] uppercase opacity-80">
            {data.iata} · {data.country}
          </p>
          <h2 className="display-serif mt-3 text-6xl leading-[0.88] sm:text-7xl lg:text-[7rem]">
            {data.city}
          </h2>
          <p className="editorial-italic mt-3 text-lg text-paper/80 sm:text-xl">
            {data.country}
          </p>
          {data.heroImage?.credit && (
            <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-paper/60">
              Photo · {data.heroImage.credit}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Featured event --------------------------------------------------

function FeaturedEvent({
  event,
  currency,
  locale,
  t,
}: {
  event: DestinationEvent;
  currency: string;
  locale: Locale;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const [failed, setFailed] = useState(false);
  const hasImage = !!event.image?.url && !failed;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid grid-cols-1 overflow-hidden border-2 border-ink bg-paper shadow-[8px_8px_0_0_var(--ink)] lg:grid-cols-5"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b-2 border-ink lg:col-span-2 lg:aspect-auto lg:border-b-0 lg:border-r-2">
        {hasImage && event.image ? (
          <img
            src={event.image.url}
            alt={event.image.alt || event.title}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-coral via-gold to-ink" />
        )}
        <span className="absolute left-4 top-4 border-2 border-ink bg-paper px-3 py-1 text-xs uppercase tracking-wider shadow-[3px_3px_0_0_var(--ink)]">
          {t("events.featured")}
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-4 p-6 lg:col-span-3 lg:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-block px-3 py-1 text-[10px] uppercase tracking-wider",
              toneFor(event.category)
            )}
          >
            {t(`events.categories.${event.category}`, {
              defaultValue: event.category,
            })}
          </span>
          {event.priceFromEur === 0 && (
            <span className="inline-block border-2 border-emerald-700 bg-emerald-700 px-3 py-1 text-[10px] uppercase tracking-wider text-paper">
              {t("events.free")}
            </span>
          )}
        </div>

        <h3 className="display-serif text-4xl leading-[0.95] sm:text-5xl">
          {event.title}
        </h3>

        {event.tagline && (
          <p className="editorial-italic text-lg text-ink-faded">
            {event.tagline}
          </p>
        )}

        <div className="mt-2 grid grid-cols-1 gap-3 border-y border-ink/20 py-4 sm:grid-cols-2">
          <div>
            <p className="small-caps mb-1 flex items-center gap-1.5 text-ink-faded">
              <Calendar className="h-3 w-3" />
              {t("events.whenLabel")}
            </p>
            <p className="body-serif text-base">
              {formatEventDates(
                event.startDate,
                event.endDate,
                event.startTime,
                t,
                locale
              )}
            </p>
            {event.startTime && (
              <p className="mt-0.5 font-mono text-xs text-ink-faded">
                <Clock className="mr-1 inline h-3 w-3" />
                {event.startTime}
              </p>
            )}
          </div>
          <div>
            <p className="small-caps mb-1 flex items-center gap-1.5 text-ink-faded">
              <MapPin className="h-3 w-3" />
              {t("events.whereLabel")}
            </p>
            <p className="body-serif text-base">{event.venue}</p>
            {event.neighbourhood && (
              <p className="editorial-italic mt-0.5 text-xs text-ink-faded">
                {event.neighbourhood}
              </p>
            )}
          </div>
        </div>

        <p className="body-serif text-pretty text-sm text-ink-soft">
          {event.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-4">
          {event.priceFromEur !== null && event.priceFromEur > 0 && (
            <p className="display-serif text-2xl">
              <span className="small-caps mr-2 text-xs text-ink-faded">
                {t("events.from")}
              </span>
              {formatCurrency(event.priceFromEur, currency)}
            </p>
          )}
          {event.ticketUrl && (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 border-2 border-ink bg-ink px-5 py-2.5 text-paper shadow-[4px_4px_0_0_var(--coral)] transition-shadow hover:shadow-[6px_6px_0_0_var(--coral)]"
            >
              <Ticket className="h-4 w-4" />
              <span className="small-caps">{t("events.buyTickets")}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ---------- Event card ------------------------------------------------------

function EventCard({
  event,
  index,
  locale,
  t,
}: {
  event: DestinationEvent;
  index: number;
  locale: Locale;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const [failed, setFailed] = useState(false);
  const hasImage = !!event.image?.url && !failed;

  const clickable = !!event.ticketUrl;

  const handleClick = () => {
    if (event.ticketUrl) {
      window.open(event.ticketUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      onClick={clickable ? handleClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      className={cn(
        "group flex h-full flex-col overflow-hidden border-2 border-ink bg-paper shadow-[4px_4px_0_0_var(--ink)] transition-shadow",
        clickable &&
          "cursor-pointer hover:shadow-[8px_8px_0_0_var(--coral)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-ink bg-ink">
        {hasImage && event.image ? (
          <img
            src={event.image.url}
            alt={event.image.alt || event.title}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-coral via-gold to-ink" />
        )}
        <span
          className={cn(
            "absolute left-3 top-3 px-2.5 py-1 text-[10px] uppercase tracking-wider",
            toneFor(event.category)
          )}
        >
          {t(`events.categories.${event.category}`, {
            defaultValue: event.category,
          })}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faded">
          {formatEventDates(
            event.startDate,
            event.endDate,
            event.startTime,
            t,
            locale
          )}
        </p>
        <h4 className="display-serif text-2xl leading-tight">{event.title}</h4>
        {event.tagline && (
          <p className="editorial-italic text-sm text-ink-faded">
            {event.tagline}
          </p>
        )}
        <p className="mt-auto flex items-start gap-1.5 pt-3 text-sm text-ink-soft">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-coral" />
          <span className="body-serif">
            {event.venue}
            {event.neighbourhood && (
              <span className="ml-1 text-ink-faded">
                · {event.neighbourhood}
              </span>
            )}
          </span>
        </p>
        {event.priceFromEur === 0 && (
          <span className="mt-1 inline-block self-start bg-emerald-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-paper">
            {t("events.free")}
          </span>
        )}
      </div>
    </motion.article>
  );
}

// ---------- Skeleton --------------------------------------------------------

function ShowcaseSkeleton({ loadingLabel }: { loadingLabel: string }) {
  return (
    <div className="space-y-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">{loadingLabel}</span>
      <div className="border-2 border-ink bg-paper shadow-[8px_8px_0_0_var(--ink)]">
        <Skeleton className="aspect-[21/9] w-full rounded-none bg-ink/10" />
      </div>
      <div className="grid grid-cols-1 gap-6 border-2 border-ink bg-paper p-6 shadow-[8px_8px_0_0_var(--ink)] lg:grid-cols-5 lg:p-10">
        <Skeleton className="aspect-[4/3] rounded-none bg-ink/10 lg:col-span-2" />
        <div className="space-y-3 lg:col-span-3">
          <Skeleton className="h-4 w-24 rounded-none bg-ink/10" />
          <Skeleton className="h-10 w-3/4 rounded-none bg-ink/10" />
          <Skeleton className="h-4 w-1/2 rounded-none bg-ink/10" />
          <Skeleton className="h-4 w-full rounded-none bg-ink/10" />
          <Skeleton className="h-4 w-5/6 rounded-none bg-ink/10" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="border-2 border-ink bg-paper shadow-[4px_4px_0_0_var(--ink)]"
          >
            <Skeleton className="aspect-[16/10] rounded-none bg-ink/10" />
            <div className="space-y-2 p-5">
              <Skeleton className="h-3 w-24 rounded-none bg-ink/10" />
              <Skeleton className="h-6 w-3/4 rounded-none bg-ink/10" />
              <Skeleton className="h-4 w-1/2 rounded-none bg-ink/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Date helpers ----------------------------------------------------

function formatEventDates(
  start: string,
  end: string,
  startTime: string,
  t: ReturnType<typeof useTranslation>["t"],
  locale: Locale
): string {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : s;

  if (isSameDay(s, e)) {
    const dayLabel = isToday(s)
      ? t("events.today")
      : isTomorrow(s)
        ? t("events.tomorrow")
        : format(s, "EEE d MMM", { locale });
    return startTime ? `${dayLabel} · ${startTime}` : dayLabel;
  }
  return `${format(s, "d MMM", { locale })} — ${format(e, "d MMM yyyy", {
    locale,
  })}`;
}
