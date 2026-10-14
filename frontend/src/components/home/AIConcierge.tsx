import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  ShieldCheck,
  CalendarDays,
  Compass,
  X,
} from "lucide-react";

import { destinationsApi } from "@/api/destinations.api";
import { AIRPORTS } from "@/lib/airports";
import { cn } from "@/lib/utils";
import type { DestinationInsights, SafetyLevel } from "@/types";

const SUGGESTIONS = [
  { iata: "CDG", label: "Paris" },
  { iata: "JFK", label: "New York" },
  { iata: "NRT", label: "Tokyo" },
  { iata: "BCN", label: "Barcelona" },
  { iata: "DXB", label: "Dubai" },
  { iata: "IST", label: "Istanbul" },
];

const SAFETY_TONE: Record<SafetyLevel, string> = {
  LOW: "bg-success/10 text-success",
  MODERATE: "bg-warning/10 text-warning",
  ELEVATED: "bg-warning/10 text-warning",
  HIGH: "bg-destructive/10 text-destructive",
};

type AirportMatch = {
  iata: string;
  city: string;
  country: string;
};

/**
 * Floating AI concierge — a floating CTA that opens a full-screen
 * panel where travellers ask about any city. Surfaces safety,
 * events, must-do and daily tips from the backend concierge
 * endpoint (Claude in live mode, curated stubs otherwise).
 */
export function AIConcierge() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ iata: string; city: string } | null>(null);

  const matches: AirportMatch[] = (() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return AIRPORTS.filter(
      (a) =>
        a.iata.toLowerCase().startsWith(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    )
      .slice(0, 6)
      .map((a) => ({ iata: a.iata, city: a.city, country: a.country }));
  })();

  const { data, isLoading, isError } = useQuery<DestinationInsights>({
    queryKey: ["destination-insights", selected?.iata],
    queryFn: () => destinationsApi.getInsights(selected!.iata),
    enabled: !!selected,
    staleTime: 1000 * 60 * 60,
  });

  const handleSelect = (iata: string, city: string) => {
    setSelected({ iata, city });
    setQuery(city);
  };

  const handleReset = () => {
    setSelected(null);
    setQuery("");
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-11 items-center gap-2 rounded-full bg-background/80 px-5 text-[15px] shadow-card backdrop-blur-xl transition-shadow hover:shadow-card-hover"
      >
        <Sparkles className="h-4 w-4 text-link" />
        {t("concierge.openLabel")}
      </button>

      {/* Slide-in panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/40"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-background shadow-modal"
            >
              <header className="flex items-center justify-between border-b border-border px-6 py-5">
                <div>
                  <p className="type-caption">
                    {t("concierge.brand")}
                  </p>
                  <h2 className="type-title">
                    {t("concierge.panelTitle")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("concierge.close")}
                  className="rounded-full bg-secondary p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Search bar */}
                <label className="block">
                  <span className="type-caption text-muted-foreground">
                    {t("concierge.searchLabel")}
                  </span>
                  <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-input px-3.5 focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setSelected(null);
                      }}
                      placeholder={t("concierge.searchPlaceholder")}
                      className="flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted-foreground"
                    />
                    {selected && (
                      <button
                        type="button"
                        onClick={handleReset}
                        aria-label={t("concierge.clear")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </label>

                {/* Autocomplete */}
                {!selected && matches.length > 0 && (
                  <div className="mt-2 overflow-hidden rounded-lg bg-secondary">
                    {matches.map((m) => (
                      <button
                        key={m.iata}
                        type="button"
                        onClick={() => handleSelect(m.iata, m.city)}
                        className="flex w-full items-baseline justify-between px-4 py-3 text-left hover:bg-accent"
                      >
                        <div>
                          <p className="font-semibold leading-snug">
                            {m.city}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {m.country}
                          </p>
                        </div>
                        <span className="tabular-nums text-xs text-muted-foreground">
                          {m.iata}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestion chips */}
                {!selected && (
                  <div className="mt-6">
                    <p className="type-caption mb-3 text-muted-foreground">
                      {t("concierge.jumpTo")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s.iata}
                          type="button"
                          onClick={() => handleSelect(s.iata, s.label)}
                          className="h-9 rounded-full bg-secondary px-4 text-[15px] transition-colors hover:bg-accent"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results */}
                {selected && (
                  <div className="mt-8 space-y-6">
                    {isError ? (
                      <div className="rounded-lg bg-secondary p-5">
                        <p className="type-body text-muted-foreground">
                          {t("concierge.error")}
                        </p>
                      </div>
                    ) : isLoading || !data ? (
                      <div className="space-y-3">
                        <div className="h-8 w-1/2 animate-pulse rounded-sm bg-foreground/[0.06]" />
                        <div className="h-4 w-full animate-pulse rounded-sm bg-foreground/[0.06]" />
                        <div className="h-4 w-4/5 animate-pulse rounded-sm bg-foreground/[0.06]" />
                      </div>
                    ) : (
                      <ConciergeAnswer data={data} />
                    )}
                  </div>
                )}
              </div>

              <footer className="border-t border-border px-6 py-3">
                <p className="type-caption">
                  {data?.source === "claude"
                    ? t("concierge.footerAi")
                    : t("concierge.footerStub")}
                </p>
              </footer>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ConciergeAnswer({ data }: { data: DestinationInsights }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <header>
        <p className="tabular-nums text-xs text-muted-foreground">
          {data.iata} · {data.country}
        </p>
        <h3 className="mt-1 text-[40px] font-semibold leading-[1.05] tracking-tight">
          {data.city}
        </h3>
        <p className="mt-3 text-[19px] leading-snug">{data.tagline}</p>
      </header>

      {/* Safety */}
      <section>
        <SectionTitle icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}>
          {t("concierge.safety")}
        </SectionTitle>
        <span
          className={cn(
            "mt-3 inline-block rounded-full px-3 py-1 text-[13px] font-medium",
            SAFETY_TONE[data.safety.level]
          )}
        >
          {t(`concierge.safetyLevels.${data.safety.level}`)}
        </span>
        <p className="type-body mt-3 text-sm text-muted-foreground">
          {data.safety.summary}
        </p>
        {data.safety.watchouts.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {data.safety.watchouts.slice(0, 4).map((w, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden="true">·</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Events */}
      {data.events.length > 0 && (
        <section>
          <SectionTitle icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}>
            {t("concierge.events")}
          </SectionTitle>
          <div className="mt-3 space-y-3">
            {data.events.slice(0, 3).map((e, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold leading-snug">
                    {e.title}
                  </p>
                  <span className="type-caption text-xs text-muted-foreground whitespace-nowrap">
                    {e.window}
                  </span>
                </div>
                <p className="type-body mt-1 text-xs text-muted-foreground">
                  {e.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Must do */}
      <section>
        <SectionTitle icon={<Compass className="h-4 w-4 text-muted-foreground" />}>
          {t("concierge.whatLocalsDo")}
        </SectionTitle>
        <ul className="mt-3 space-y-3">
          {data.mustDo.slice(0, 4).map((x, i) => (
            <li key={i}>
              <p className="font-semibold leading-snug">
                {x.title}
              </p>
              <p className="type-body mt-1 text-xs text-muted-foreground">
                {x.description}
                {x.neighbourhood && (
                  <span className="ml-1 text-muted-foreground">· {x.neighbourhood}</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Daily tips */}
      <section>
        <SectionTitle icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}>
          {t("concierge.dailyTips")}
        </SectionTitle>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.dailyTips.slice(0, 4).map((tip, i) => (
            <div
              key={i}
              className="rounded-md bg-secondary p-4"
            >
              <p className="type-caption">
                {tip.icon}
              </p>
              <p className="type-body mt-1 text-sm font-medium">{tip.title}</p>
              <p className="type-body mt-0.5 text-xs text-muted-foreground">
                {tip.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <p className="type-caption">{children}</p>
    </div>
  );
}
