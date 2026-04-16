import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CalendarDays,
  Sparkles,
  Compass,
  Languages,
  Wallet,
  Bus,
  Plug,
  Clock,
  ArrowRight,
} from "lucide-react";

import { destinationsApi } from "@/api/destinations.api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DestinationInsights, SafetyLevel } from "@/types";

const ROTATION = [
  { iata: "CDG", hero: "Paris", tagline: "City of cafés and Sunday walks." },
  { iata: "NRT", hero: "Tokyo", tagline: "The quietest megacity on earth." },
  { iata: "BCN", hero: "Barcelona", tagline: "Modernista lines, Mediterranean sea." },
  { iata: "JFK", hero: "New York", tagline: "Loud, fast, astonishingly walkable." },
  { iata: "IST", hero: "Istanbul", tagline: "Two continents, one long breakfast." },
  { iata: "SIN", hero: "Singapore", tagline: "A tropical city built for strangers." },
];

const SAFETY_TONES: Record<SafetyLevel, string> = {
  LOW: "bg-emerald-700 text-paper",
  MODERATE: "bg-gold text-ink",
  ELEVATED: "bg-orange-700 text-paper",
  HIGH: "bg-postmark-red text-paper",
};

/**
 * Rotating spotlight of a featured city with AI-powered insights
 * (safety, events, must-do, tips, practicals). Lazily fetches
 * only when the section scrolls into view.
 */
export function DestinationSpotlight() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const selection = ROTATION[active];

  const { data, isLoading, isError } = useQuery<DestinationInsights>({
    queryKey: ["destination-insights", selection.iata],
    queryFn: () => destinationsApi.getInsights(selection.iata),
    staleTime: 1000 * 60 * 60,
  });

  return (
    <section className="border-t-2 border-ink bg-paper-deep py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="mb-10 flex flex-col items-baseline justify-between gap-4 sm:flex-row">
          <div className="max-w-2xl">
            <p className="small-caps mb-3 text-coral">
              {t("home.spotlight.eyebrow")}
            </p>
            <h2 className="display-serif text-5xl leading-[0.95] sm:text-6xl">
              {t("home.spotlight.titlePre")}{" "}
              <span className="display-serif-italic text-coral">
                {t("home.spotlight.titleItalic")}
              </span>
              {t("home.spotlight.titleDot")}
            </h2>
            <p className="body-serif mt-4 text-pretty text-ink-soft">
              {t("home.spotlight.description")}
            </p>
          </div>

          {/* City pills */}
          <div className="flex flex-wrap gap-2">
            {ROTATION.map((r, i) => (
              <button
                key={r.iata}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "border-2 border-ink px-3 py-1.5 text-xs tracking-wider uppercase transition-all",
                  active === i
                    ? "bg-ink text-paper shadow-[3px_3px_0_0_var(--coral)]"
                    : "bg-paper hover:bg-ink/5"
                )}
              >
                {r.hero}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Hero column */}
          <motion.div
            key={selection.iata + "-hero"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative border-2 border-ink bg-paper p-8 shadow-[8px_8px_0_0_var(--ink)] lg:col-span-5 lg:p-10"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-mono text-xs tracking-wider text-ink-faded">
                {t("home.spotlight.airportLabel", { iata: selection.iata })}
              </span>
              <span className="small-caps text-coral">
                {t("home.spotlight.concierge")}
              </span>
            </div>
            <h3 className="display-serif text-7xl leading-[0.9] text-ink">
              {data?.city ?? selection.hero}
            </h3>
            <p className="editorial-italic mt-2 text-lg text-ink-faded">
              {data?.country ?? "…"}
            </p>
            <p className="body-serif mt-6 text-pretty text-lg">
              {data?.tagline ?? selection.tagline}
            </p>

            {/* Safety strip */}
            <div className="mt-8 border-t border-ink/30 pt-6">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-coral" />
                <p className="small-caps text-ink-faded">
                  {t("home.spotlight.safetySnapshot")}
                </p>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : data ? (
                <div className="space-y-3">
                  <span
                    className={cn(
                      "inline-block px-3 py-1 text-xs uppercase tracking-wider",
                      SAFETY_TONES[data.safety.level]
                    )}
                  >
                    {t(`concierge.safetyLevels.${data.safety.level}`)}
                  </span>
                  <p className="body-serif text-sm text-ink-soft">
                    {data.safety.summary}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Practical strip */}
            {data && (
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-ink/30 pt-6 text-xs">
                <Practical
                  icon={<Wallet className="h-3.5 w-3.5" />}
                  label={t("home.spotlight.currency")}
                  value={data.practical.currency}
                />
                <Practical
                  icon={<Languages className="h-3.5 w-3.5" />}
                  label={t("home.spotlight.language")}
                  value={data.practical.language}
                />
                <Practical
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label={t("home.spotlight.timezone")}
                  value={data.practical.timezone}
                />
                <Practical
                  icon={<Plug className="h-3.5 w-3.5" />}
                  label={t("home.spotlight.plug")}
                  value={data.practical.plug}
                />
                <Practical
                  icon={<Bus className="h-3.5 w-3.5" />}
                  label={t("home.spotlight.transport")}
                  value={data.practical.transportTip}
                  span={2}
                />
              </div>
            )}
          </motion.div>

          {/* Insights column */}
          <div className="space-y-6 lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={selection.iata + "-insights"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45 }}
                className="space-y-6"
              >
                {isError ? (
                  <div className="border-2 border-dashed border-ink/40 p-6">
                    <p className="body-serif text-ink-faded">
                      {t("home.spotlight.error")}
                    </p>
                  </div>
                ) : isLoading || !data ? (
                  <SpotlightSkeleton />
                ) : (
                  <>
                    {/* Must do */}
                    <Card
                      title={t("home.spotlight.whatNotToMiss")}
                      icon={<Sparkles className="h-4 w-4 text-coral" />}
                    >
                      <ul className="divide-y divide-ink/15">
                        {data.mustDo.slice(0, 4).map((x, i) => (
                          <li key={i} className="py-3">
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="display-serif text-lg leading-tight">
                                {x.title}
                              </p>
                              {x.neighbourhood && (
                                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faded whitespace-nowrap">
                                  {x.neighbourhood}
                                </span>
                              )}
                            </div>
                            <p className="body-serif mt-1 text-sm text-ink-soft">
                              {x.description}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    {/* Events */}
                    {data.events.length > 0 && (
                      <Card
                        title={t("home.spotlight.inSeason")}
                        icon={<CalendarDays className="h-4 w-4 text-coral" />}
                      >
                        <div className="space-y-4">
                          {data.events.slice(0, 3).map((e, i) => (
                            <div key={i}>
                              <div className="flex items-baseline justify-between gap-3">
                                <p className="display-serif text-lg leading-tight">
                                  {e.title}
                                </p>
                                <span className="small-caps text-ink-faded whitespace-nowrap">
                                  {e.window}
                                </span>
                              </div>
                              <p className="body-serif mt-1 text-sm text-ink-soft">
                                {e.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Daily tips */}
                    <Card
                      title={t("home.spotlight.dailyTips")}
                      icon={<Compass className="h-4 w-4 text-coral" />}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {data.dailyTips.slice(0, 4).map((t, i) => (
                          <div
                            key={i}
                            className="border border-ink/20 bg-paper-deep/40 px-4 py-3"
                          >
                            <p className="small-caps text-ink-faded">
                              {t.icon}
                            </p>
                            <p className="display-serif mt-1 text-base leading-tight">
                              {t.title}
                            </p>
                            <p className="body-serif mt-1 text-xs text-ink-soft">
                              {t.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Footer attribution */}
                    <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faded">
                      {t("home.spotlight.briefingBy")}{" "}
                      {data.source === "claude"
                        ? t("home.spotlight.byAI")
                        : t("home.spotlight.byEditors")}{" "}
                      · <ArrowRight className="inline h-3 w-3" />{" "}
                      {t("home.spotlight.verifyNotice")}
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-2 border-ink bg-paper p-6 shadow-[4px_4px_0_0_var(--ink)] lg:p-7">
      <div className="mb-4 flex items-center gap-2 border-b border-ink/30 pb-3">
        {icon}
        <p className="small-caps text-ink">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Practical({
  icon,
  label,
  value,
  span = 1,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  span?: 1 | 2;
}) {
  return (
    <div className={cn(span === 2 && "col-span-2")}>
      <div className="mb-1 flex items-center gap-1.5 text-ink-faded">
        {icon}
        <p className="small-caps text-[10px]">{label}</p>
      </div>
      <p className="body-serif text-sm text-ink">{value || "—"}</p>
    </div>
  );
}

function SpotlightSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="border-2 border-ink/30 bg-paper p-6">
          <Skeleton className="mb-4 h-4 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
