import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { BookingLookupDialog } from "@/components/booking/BookingLookupDialog";
import { Button } from "@/components/ui/button";

interface HeroProps {
  /** Called when the visitor asks to search for a flight. */
  onSearchClick: () => void;
}

export function Hero({ onSearchClick }: HeroProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [lookupOpen, setLookupOpen] = useState(false);

  return (
    <section className="overflow-hidden bg-background pt-16 md:pt-24">
      <div className="content text-center">
        <h1 className="type-hero">{t("home.hero.title")}</h1>
        <p className="type-lede mx-auto mt-5 max-w-[32ch]">
          {t("home.hero.subtitle")}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
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

      <motion.img
        src="/avionhero.png"
        alt={t("home.hero.imageAlt")}
        width={700}
        height={350}
        decoding="async"
        // The plane faces left, so it flies in nose-first from beyond the
        // right edge, descending with its nose slightly up, and brakes to a stop at centre.
        initial={reduceMotion ? false : { x: "100vw", y: -48, rotate: 3 }}
        animate={{ x: 0, y: 0, rotate: 0 }}
        transition={{
          x: { duration: 2.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
          y: { duration: 2.2, delay: 0.3, ease: [0.33, 1, 0.68, 1] },
          rotate: { duration: 2.4, delay: 0.3, ease: [0.33, 1, 0.68, 1] },
        }}
        className="mx-auto mt-6 h-auto w-full max-w-[780px] px-4 will-change-transform md:mt-2"
      />

      <BookingLookupDialog open={lookupOpen} onOpenChange={setLookupOpen} />
    </section>
  );
}
