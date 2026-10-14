import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

import { BookingLookupDialog } from "@/components/booking/BookingLookupDialog";
import { HeroJourney } from "@/components/home/HeroJourney";
import { Button } from "@/components/ui/button";

interface HeroProps {
  /** Called when the visitor asks to search for a flight. */
  onSearchClick: () => void;
}

export function Hero({ onSearchClick }: HeroProps) {
  const { t } = useTranslation();
  const [lookupOpen, setLookupOpen] = useState(false);

  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_30%,#e9f3ff_72%,#ffffff_100%)] pb-12 pt-12 md:pb-14 md:pt-10">
      <div className="content text-center">
        <h1 className="type-hero text-link">{t("home.hero.title")}</h1>
        <p className="type-lede mx-auto mt-5 max-w-[32ch]">
          {t("home.hero.subtitle")}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
          <Button size="lg" onClick={onSearchClick}>
            {t("home.hero.cta")}
          </Button>
          <button
            type="button"
            onClick={() => setLookupOpen(true)}
            className="inline-flex items-center gap-0.5 text-[17px] text-link hover:underline"
          >
            {t("home.hero.lookup")}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <HeroJourney />

      <BookingLookupDialog open={lookupOpen} onOpenChange={setLookupOpen} />
    </section>
  );
}
