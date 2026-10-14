import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Luggage, ShieldCheck, Smartphone } from "lucide-react";

import { FlightSearchForm } from "@/components/flights/FlightSearchForm";
import { LiveDealsSection } from "@/components/home/LiveDealsSection";
import { DestinationSpotlight } from "@/components/home/DestinationSpotlight";
import { AIConcierge } from "@/components/home/AIConcierge";
import { Hero } from "@/components/home/Hero";
import { PaymentMethods } from "@/components/shared/PaymentMethods";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

import { useFlightStore } from "@/stores/useFlightStore";
import type { FlightSearchParams } from "@/types";
import { usePageMeta } from "@/hooks/usePageMeta";

const SERVICES = [
  { key: "baggage", icon: Luggage },
  { key: "checkin", icon: Smartphone },
  { key: "insurance", icon: ShieldCheck },
] as const;

const TRANSFER_OPTIONS = ["arrivals", "cityRental"] as const;

const SEARCH_SECTION_ID = "search";

function scrollToSearch() {
  document
    .getElementById(SEARCH_SECTION_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HomePage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("meta.home.title"), description: t("meta.home.description") });
  const navigate = useNavigate();
  const setSearchParams = useFlightStore((s) => s.setSearchParams);

  const handleSearch = (data: FlightSearchParams) => {
    setSearchParams(data);
    navigate("/flights");
  };

  return (
    <>
      <Hero onSearchClick={scrollToSearch} />

      <section id={SEARCH_SECTION_ID} className="section scroll-mt-12 bg-secondary">
        <div className="content">
          <Reveal className="text-center">
            <h2 className="type-headline">{t("home.search.title")}</h2>
            <p className="type-lede mx-auto mt-4 max-w-[40ch]">
              {t("home.search.subtitle")}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 rounded-3xl bg-card p-6 md:p-10">
            <FlightSearchForm onSearch={handleSearch} />
          </Reveal>
        </div>
      </section>

      <LiveDealsSection />

      <section className="section bg-secondary">
        <div className="content-wide">
          <Reveal>
            <h2 className="type-headline text-center">
              {t("home.services.title")}
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {SERVICES.map(({ key, icon: Icon }, i) => (
              <Reveal
                key={key}
                delay={i * 0.08}
                className="rounded-xl bg-card p-8"
              >
                <Icon className="h-8 w-8 text-link" strokeWidth={1.5} />
                <h3 className="type-title mt-6">
                  {t(`home.services.${key}.title`)}
                </h3>
                <p className="type-body mt-2">
                  {t(`home.services.${key}.description`)}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <DestinationSpotlight />

      <section className="section bg-foreground text-secondary">
        <div className="content-wide">
          <Reveal className="mx-auto max-w-[720px] text-center">
            <h2 className="type-headline">{t("home.transfer.title")}</h2>
            <p className="type-lede mt-4 text-secondary/70">
              {t("home.transfer.description")}
            </p>
            <Link
              to="/transport"
              className="mt-6 inline-flex items-center gap-0.5 text-[17px] text-link-on-dark hover:underline"
            >
              {t("home.transfer.cta")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {TRANSFER_OPTIONS.map((key, i) => (
              <Reveal
                key={key}
                delay={i * 0.08}
                className="rounded-xl bg-white/[0.08] p-8 md:p-10"
              >
                <h3 className="type-title">
                  {t(`home.transfer.${key}.title`)}
                </h3>
                <p className="type-body mt-2 text-secondary/70">
                  {t(`home.transfer.${key}.description`)}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="content">
          <Reveal className="text-center">
            <h2 className="type-headline">{t("home.payments.title")}</h2>
            <p className="type-lede mx-auto mt-4 max-w-[44ch]">
              {t("home.payments.description")}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <PaymentMethods />
          </Reveal>
        </div>
      </section>

      <section className="section bg-secondary">
        <Reveal className="content text-center">
          <h2 className="type-headline">{t("home.closing.title")}</h2>
          <p className="type-lede mt-4">{t("home.closing.subtitle")}</p>
          <Button size="lg" className="mt-8" onClick={scrollToSearch}>
            {t("home.closing.cta")}
          </Button>
        </Reveal>
      </section>

      <AIConcierge />
    </>
  );
}
