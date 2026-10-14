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
} from "lucide-react";

import { destinationsApi } from "@/api/destinations.api";
import { Reveal } from "@/components/ui/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DestinationInsights, SafetyLevel } from "@/types";

const ROTATION = [
  { iata: "CDG", city: "Paris" },
  { iata: "NRT", city: "Tokyo" },
  { iata: "BCN", city: "Barcelona" },
  { iata: "JFK", city: "New York" },
  { iata: "IST", city: "Istanbul" },
  { iata: "SIN", city: "Singapore" },
];

const SAFETY_TONES: Record<SafetyLevel, string> = {
  LOW: "bg-success/10 text-success",
  MODERATE: "bg-warning/10 text-warning",
  ELEVATED: "bg-warning/10 text-warning",
  HIGH: "bg-destructive/10 text-destructive",
};

/**
 * City guide for a featured destination with AI-powered insights
 * (safety, events, must-do, tips, practicals), one city at a time.
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
    <section className="section bg-background">
      <div className="content-wide">
        <Reveal className="text-center">
          <h2 className="type-headline">{t("home.spotlight.title")}</h2>
          <p className="type-lede mx-auto mt-4 max-w-[44ch]">
            {t("home.spotlight.description")}
          </p>
        </Reveal>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {ROTATION.map((r, i) => (
            <button
              key={r.iata}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              className={cn(
                "h-9 rounded-full px-4 text-[15px] transition-colors",
                active === i
                  ? "bg-foreground text-background"
                  : "bg-secondary text-foreground hover:bg-accent"
              )}
            >
              {r.city}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="rounded-xl bg-secondary p-8 lg:col-span-5 lg:p-10">
            <p className="type-caption">
              {t("home.spotlight.airportLabel", { iata: selection.iata })}
            </p>
            <h3 className="mt-2 text-[40px] font-semibold leading-[1.05] tracking-tight md:text-[48px]">
              {data?.city ?? selection.city}
            </h3>
            {data && (
              <>
                <p className="type-body mt-1">{data.country}</p>
                <p className="mt-6 text-[19px] leading-snug">{data.tagline}</p>
              </>
            )}

            <div className="mt-8 border-t border-border pt-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <p className="type-caption">
                  {t("home.spotlight.safetySnapshot")}
                </p>
              </div>
              {isLoading ? (
                <Skeleton className="mt-3 h-6 w-32" />
              ) : data ? (
                <>
                  <span
                    className={cn(
                      "mt-3 inline-block rounded-full px-3 py-1 text-[13px] font-medium",
                      SAFETY_TONES[data.safety.level]
                    )}
                  >
                    {t(`concierge.safetyLevels.${data.safety.level}`)}
                  </span>
                  <p className="mt-3 text-[15px] leading-normal text-muted-foreground">
                    {data.safety.summary}
                  </p>
                </>
              ) : null}
            </div>

            {data && (
              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 sm:grid-cols-3">
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
          </div>

          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={selection.iata}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {isError ? (
                  <div className="rounded-xl bg-secondary p-8">
                    <p className="type-body">{t("home.spotlight.error")}</p>
                  </div>
                ) : isLoading || !data ? (
                  <SpotlightSkeleton />
                ) : (
                  <>
                    <Card
                      title={t("home.spotlight.whatNotToMiss")}
                      icon={<Sparkles className="h-4 w-4" />}
                    >
                      <ul className="divide-y divide-border">
                        {data.mustDo.slice(0, 4).map((x, i) => (
                          <li key={i} className="py-3 first:pt-0 last:pb-0">
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="font-semibold leading-snug">
                                {x.title}
                              </p>
                              {x.neighbourhood && (
                                <span className="type-caption whitespace-nowrap">
                                  {x.neighbourhood}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[15px] leading-normal text-muted-foreground">
                              {x.description}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    {data.events.length > 0 && (
                      <Card
                        title={t("home.spotlight.inSeason")}
                        icon={<CalendarDays className="h-4 w-4" />}
                      >
                        <div className="space-y-4">
                          {data.events.slice(0, 3).map((e, i) => (
                            <div key={i}>
                              <div className="flex items-baseline justify-between gap-3">
                                <p className="font-semibold leading-snug">
                                  {e.title}
                                </p>
                                <span className="type-caption whitespace-nowrap">
                                  {e.window}
                                </span>
                              </div>
                              <p className="mt-1 text-[15px] leading-normal text-muted-foreground">
                                {e.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    <Card
                      title={t("home.spotlight.dailyTips")}
                      icon={<Compass className="h-4 w-4" />}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {data.dailyTips.slice(0, 4).map((tip, i) => (
                          <div key={i} className="rounded-md bg-background p-4">
                            <p className="text-[15px] font-semibold leading-snug">
                              {tip.title}
                            </p>
                            <p className="type-caption mt-1">{tip.detail}</p>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <p className="type-caption">
                      {t("home.spotlight.briefingBy")}{" "}
                      {data.source === "claude"
                        ? t("home.spotlight.byAI")
                        : t("home.spotlight.byEditors")}
                      . {t("home.spotlight.verifyNotice")}.
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
    <div className="rounded-xl bg-secondary p-7">
      <div className="mb-4 flex items-center gap-2 text-muted-foreground">
        {icon}
        <p className="type-caption">{title}</p>
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
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <p className="type-caption">{label}</p>
      </div>
      <p className="mt-1 text-[15px] leading-snug">{value || "—"}</p>
    </div>
  );
}

function SpotlightSkeleton() {
  return (
    <div className="space-y-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl bg-secondary p-7">
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
