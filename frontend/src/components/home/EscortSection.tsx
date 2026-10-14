import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/ui/reveal";
import {
  DEFAULT_ESCORT_TIER,
  ESCORT_TIERS,
  type EscortTierId,
} from "@/lib/escort";
import { cn } from "@/lib/utils";

/**
 * Home teaser for the security escort service: pick a level, say where and
 * when you land, and carry on to the escort page with the request started.
 */
export function EscortSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [tier, setTier] = useState<EscortTierId>(DEFAULT_ESCORT_TIER);
  const [airport, setAirport] = useState("");
  const [date, setDate] = useState("");

  const euros = new Intl.NumberFormat(i18n.resolvedLanguage ?? "en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ level: tier, airport: airport.trim(), date });
    navigate(`/transport?${params}`);
  };

  return (
    <section className="section bg-foreground text-secondary">
      <div className="content-wide">
        <Reveal className="mx-auto max-w-[820px] text-center">
          <h2 className="type-headline">{t("home.escort.title")}</h2>
          <p className="type-lede mt-4 text-secondary/70">
            {t("home.escort.subtitle")}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="grid grid-cols-2 gap-3 md:gap-5">
            {[1, 2].map((n) => (
              <img
                key={n}
                src={`/escort-agent-${n}.webp`}
                alt={t("home.escort.agentAlt")}
                width={800}
                height={1000}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full rounded-xl object-cover"
              />
            ))}
          </Reveal>

          <Reveal delay={0.1}>
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-white/[0.08] p-6 md:p-8"
            >
              <fieldset>
                <legend className="text-[15px] font-semibold">
                  {t("home.escort.level")}
                </legend>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {ESCORT_TIERS.map(({ id, hourlyEur }) => (
                    <label
                      key={id}
                      className={cn(
                        "cursor-pointer rounded-xl px-1 py-3 text-center sm:px-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-white",
                        tier === id
                          ? "bg-white text-foreground"
                          : "bg-white/[0.08] hover:bg-white/[0.14]"
                      )}
                    >
                      <input
                        type="radio"
                        name="escort-level"
                        value={id}
                        checked={tier === id}
                        onChange={() => setTier(id)}
                        className="sr-only"
                      />
                      <span className="block text-[14px] font-semibold sm:text-[15px]">
                        {t(`home.escort.tiers.${id}`)}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-[13px]",
                          tier === id ? "text-muted-foreground" : "text-secondary/70"
                        )}
                      >
                        {hourlyEur === null
                          ? t("home.escort.onQuote")
                          : t("home.escort.perHour", {
                              price: euros.format(hourlyEur),
                            })}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="escort-airport">
                    {t("home.escort.airport")}
                  </Label>
                  <Input
                    id="escort-airport"
                    required
                    value={airport}
                    onChange={(e) => setAirport(e.target.value)}
                    placeholder="Paris (CDG)"
                    autoComplete="off"
                    className="border-transparent text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="escort-date">{t("home.escort.date")}</Label>
                  <Input
                    id="escort-date"
                    type="date"
                    required
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border-transparent text-foreground"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
                <Button type="submit" size="lg">
                  {t("home.escort.submit")}
                </Button>
                <Link
                  to="/transport"
                  className="inline-flex items-center gap-1.5 text-[17px] text-link-on-dark hover:underline"
                >
                  {t("home.escort.more")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
