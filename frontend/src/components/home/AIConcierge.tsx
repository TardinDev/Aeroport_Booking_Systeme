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
  LOW: "bg-emerald-700 text-paper",
  MODERATE: "bg-gold text-ink",
  ELEVATED: "bg-orange-700 text-paper",
  HIGH: "bg-postmark-red text-paper",
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
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        aria-label={t("concierge.openLabel")}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 border-2 border-ink bg-paper px-5 py-3 shadow-[4px_4px_0_0_var(--ink)] transition-shadow hover:shadow-[6px_6px_0_0_var(--coral)]"
      >
        <Sparkles className="h-4 w-4 text-coral" />
        <span className="small-caps text-xs">{t("concierge.openLabel")}</span>
      </motion.button>

      {/* Slide-in panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="paper-bg grain fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l-2 border-ink shadow-[-8px_0_0_0_var(--ink)]"
            >
              <header className="flex items-center justify-between border-b-2 border-ink px-6 py-4">
                <div>
                  <p className="small-caps text-coral">
                    {t("concierge.brand")}
                  </p>
                  <h2 className="display-serif text-2xl leading-tight">
                    {t("concierge.panelTitle")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("concierge.close")}
                  className="rounded-full border border-ink/40 p-1.5 hover:bg-ink/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Search bar */}
                <label className="block">
                  <span className="small-caps text-ink-faded">
                    {t("concierge.searchLabel")}
                  </span>
                  <div className="mt-2 flex items-center gap-2 border-2 border-ink bg-paper px-3 py-2 shadow-[3px_3px_0_0_var(--ink)] focus-within:shadow-[4px_4px_0_0_var(--coral)]">
                    <Search className="h-4 w-4 text-ink-faded" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setSelected(null);
                      }}
                      placeholder={t("concierge.searchPlaceholder")}
                      className="flex-1 bg-transparent text-base outline-none placeholder:text-ink-faded/60"
                    />
                    {selected && (
                      <button
                        type="button"
                        onClick={handleReset}
                        aria-label={t("concierge.clear")}
                        className="text-ink-faded hover:text-ink"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </label>

                {/* Autocomplete */}
                {!selected && matches.length > 0 && (
                  <div className="mt-2 border-2 border-ink bg-paper shadow-[4px_4px_0_0_var(--ink)]">
                    {matches.map((m) => (
                      <button
                        key={m.iata}
                        type="button"
                        onClick={() => handleSelect(m.iata, m.city)}
                        className="flex w-full items-baseline justify-between border-b border-ink/20 px-4 py-3 text-left last:border-0 hover:bg-ink/5"
                      >
                        <div>
                          <p className="display-serif text-lg leading-none">
                            {m.city}
                          </p>
                          <p className="editorial-italic mt-0.5 text-xs text-ink-faded">
                            {m.country}
                          </p>
                        </div>
                        <span className="font-mono text-xs tracking-wider text-ink-faded">
                          {m.iata}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestion chips */}
                {!selected && (
                  <div className="mt-6">
                    <p className="small-caps mb-3 text-ink-faded">
                      {t("concierge.jumpTo")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s.iata}
                          type="button"
                          onClick={() => handleSelect(s.iata, s.label)}
                          className="border-2 border-ink bg-paper px-3 py-1.5 text-xs uppercase tracking-wider transition-all hover:bg-ink hover:text-paper hover:shadow-[3px_3px_0_0_var(--coral)]"
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
                      <div className="border-2 border-dashed border-ink/40 p-4">
                        <p className="body-serif text-ink-faded">
                          {t("concierge.error")}
                        </p>
                      </div>
                    ) : isLoading || !data ? (
                      <div className="space-y-3">
                        <div className="h-8 w-1/2 animate-pulse bg-ink/10" />
                        <div className="h-4 w-full animate-pulse bg-ink/10" />
                        <div className="h-4 w-4/5 animate-pulse bg-ink/10" />
                      </div>
                    ) : (
                      <ConciergeAnswer data={data} />
                    )}
                  </div>
                )}
              </div>

              <footer className="border-t-2 border-ink px-6 py-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faded">
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
        <p className="font-mono text-xs tracking-wider text-ink-faded">
          {data.iata} · {data.country}
        </p>
        <h3 className="display-serif mt-1 text-5xl leading-[0.95]">
          {data.city}
        </h3>
        <p className="body-serif mt-3 text-pretty text-base">{data.tagline}</p>
      </header>

      {/* Safety */}
      <section>
        <SectionTitle icon={<ShieldCheck className="h-4 w-4 text-coral" />}>
          {t("concierge.safety")}
        </SectionTitle>
        <span
          className={cn(
            "mt-3 inline-block px-3 py-1 text-xs uppercase tracking-wider",
            SAFETY_TONE[data.safety.level]
          )}
        >
          {t(`concierge.safetyLevels.${data.safety.level}`)}
        </span>
        <p className="body-serif mt-3 text-sm text-ink-soft">
          {data.safety.summary}
        </p>
        {data.safety.watchouts.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
            {data.safety.watchouts.slice(0, 4).map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-coral">·</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Events */}
      {data.events.length > 0 && (
        <section>
          <SectionTitle icon={<CalendarDays className="h-4 w-4 text-coral" />}>
            {t("concierge.events")}
          </SectionTitle>
          <div className="mt-3 space-y-3">
            {data.events.slice(0, 3).map((e, i) => (
              <div key={i} className="border-l-2 border-ink/30 pl-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="display-serif text-base leading-tight">
                    {e.title}
                  </p>
                  <span className="small-caps text-xs text-ink-faded whitespace-nowrap">
                    {e.window}
                  </span>
                </div>
                <p className="body-serif mt-1 text-xs text-ink-soft">
                  {e.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Must do */}
      <section>
        <SectionTitle icon={<Compass className="h-4 w-4 text-coral" />}>
          {t("concierge.whatLocalsDo")}
        </SectionTitle>
        <ul className="mt-3 space-y-3">
          {data.mustDo.slice(0, 4).map((x, i) => (
            <li key={i}>
              <p className="display-serif text-base leading-tight">
                {x.title}
              </p>
              <p className="body-serif mt-1 text-xs text-ink-soft">
                {x.description}
                {x.neighbourhood && (
                  <span className="ml-1 text-ink-faded">· {x.neighbourhood}</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Daily tips */}
      <section>
        <SectionTitle icon={<Sparkles className="h-4 w-4 text-coral" />}>
          {t("concierge.dailyTips")}
        </SectionTitle>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.dailyTips.slice(0, 4).map((tip, i) => (
            <div
              key={i}
              className="border border-ink/20 bg-paper-deep/40 px-3 py-2"
            >
              <p className="small-caps text-[10px] text-ink-faded">
                {tip.icon}
              </p>
              <p className="body-serif mt-1 text-sm font-medium">{tip.title}</p>
              <p className="body-serif mt-0.5 text-xs text-ink-soft">
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
    <div className="flex items-center gap-2 border-b border-ink/20 pb-2">
      {icon}
      <p className="small-caps text-ink">{children}</p>
    </div>
  );
}
