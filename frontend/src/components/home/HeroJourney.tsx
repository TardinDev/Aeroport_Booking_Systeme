import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { RIDE_AMENITIES } from "@/lib/ride";
import { cn } from "@/lib/utils";

interface Stop {
  /** Key under `cities.` in the locale files. */
  city: string;
  /** ISO 3166 region code, turned into a localized country name. */
  country: string;
  iata: string;
}

const ROUTES: { from: Stop; to: Stop }[] = [
  {
    from: { city: "paris", country: "FR", iata: "CDG" },
    to: { city: "newYork", country: "US", iata: "JFK" },
  },
  {
    from: { city: "london", country: "GB", iata: "LHR" },
    to: { city: "tokyo", country: "JP", iata: "HND" },
  },
  {
    from: { city: "madrid", country: "ES", iata: "MAD" },
    to: { city: "istanbul", country: "TR", iata: "IST" },
  },
  {
    from: { city: "paris", country: "FR", iata: "CDG" },
    to: { city: "singapore", country: "SG", iata: "SIN" },
  },
  {
    from: { city: "newYork", country: "US", iata: "JFK" },
    to: { city: "barcelona", country: "ES", iata: "BCN" },
  },
];

const ROUTE_INTERVAL_MS = 4000;

// One timeline: the plane lands, then the car sets off and the perks
// appear one by one while it drives in.
const FLIGHT = { duration: 2.2, delay: 0.3 };
const DRIVE = { duration: 2, delay: 1.9 };
const EASE_BRAKE = [0.16, 1, 0.3, 1] as const;
const EASE_SOFT = [0.33, 1, 0.68, 1] as const;

/**
 * The hero's picture of the product: a flight between two cities, then the
 * car that takes over on the ground, with what the ride offers.
 */
export function HeroJourney() {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [routeIndex, setRouteIndex] = useState(0);
  const route = ROUTES[routeIndex];

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(
      () => setRouteIndex((i) => (i + 1) % ROUTES.length),
      ROUTE_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const countryNames = new Intl.DisplayNames(i18n.resolvedLanguage ?? "en", {
    type: "region",
  });

  return (
    <div className="content-wide mt-8 md:mt-0">
      {/* Sky: the plane faces left, so it departs on the right. */}
      <div className="relative">
        <svg
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 hidden h-full w-full md:block"
        >
          <defs>
            <linearGradient id="route-stroke" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor="var(--color-rose)" />
              <stop offset="0.5" stopColor="var(--color-grape)" />
              <stop offset="1" stopColor="var(--color-sky)" />
            </linearGradient>
          </defs>
          <motion.path
            d="M960 205Q500 -70 40 205"
            fill="none"
            stroke="url(#route-stroke)"
            strokeWidth="2"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...FLIGHT, ease: EASE_SOFT }}
          />
          <circle cx="960" cy="205" r="5" fill="var(--color-rose)" />
          <motion.circle
            cx="40"
            cy="205"
            r="5"
            fill="var(--color-sky)"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: FLIGHT.delay + FLIGHT.duration - 0.3,
            }}
          />
        </svg>

        <div className="flex items-start justify-between gap-6 md:block">
          <StopLabel
            caption={t("home.journey.arrival")}
            captionClassName="text-sky"
            stop={route.to}
            country={countryNames.of(route.to.country) ?? ""}
            className="text-left md:absolute md:left-0 md:top-[74%]"
          />
          <StopLabel
            caption={t("home.journey.departure")}
            captionClassName="text-rose"
            stop={route.from}
            country={countryNames.of(route.from.country) ?? ""}
            className="text-right md:absolute md:right-0 md:top-[74%]"
          />
        </div>

        <motion.img
          src="/avionhero.png"
          alt={t("home.hero.imageAlt")}
          width={690}
          height={362}
          decoding="async"
          // Nose-first from beyond the right edge, descending with its
          // nose slightly up, braking to a stop at centre.
          initial={reduceMotion ? false : { x: "100vw", y: -48, rotate: 3 }}
          animate={{ x: 0, y: 0, rotate: 0 }}
          transition={{
            x: { ...FLIGHT, ease: EASE_BRAKE },
            y: { ...FLIGHT, ease: EASE_SOFT },
            rotate: { ...FLIGHT, duration: 2.4, ease: EASE_SOFT },
          }}
          className="relative mx-auto h-auto w-full max-w-[520px] will-change-transform"
        />
      </div>

      {/* Ground: the car takes over where the plane stops. The wrapper is
          what gets observed, since the car itself starts off-screen. */}
      <motion.div
        initial={reduceMotion ? false : "parked"}
        whileInView="arrived"
        viewport={{ once: true }}
      >
        <div className="relative -mt-2 md:-mt-12">
          <motion.img
            src="/chauffeur-car.webp"
            alt={t("home.journey.carAlt")}
            width={960}
            height={317}
            loading="eager"
            decoding="async"
            variants={{ parked: { x: "-100vw" }, arrived: { x: 0 } }}
            transition={{ ...DRIVE, ease: EASE_BRAKE }}
            className="relative z-10 mx-auto h-auto w-[200px] will-change-transform md:w-[260px]"
          />
          <motion.div
            aria-hidden="true"
            variants={{ parked: { scaleX: 0 }, arrived: { scaleX: 1 } }}
            transition={{ ...DRIVE, ease: EASE_SOFT }}
            className="absolute inset-x-0 bottom-[3%] h-px origin-left bg-foreground/15"
          />
        </div>

        <div className="pt-4 text-center">
          <motion.p
            variants={{ parked: { opacity: 0 }, arrived: { opacity: 1 } }}
            transition={{
              duration: 0.6,
              delay: DRIVE.delay,
            }}
            className="type-caption"
          >
            {t("home.journey.during")}
          </motion.p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2.5">
            {RIDE_AMENITIES.map(({ key, icon: Icon, tone }, i) => (
              <motion.li
                key={key}
                variants={{
                  parked: { opacity: 0, y: 14, scale: 0.94 },
                  arrived: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{
                  duration: 0.5,
                  delay: DRIVE.delay + i * 0.14,
                  ease: EASE_SOFT,
                }}
                className="inline-flex h-10 items-center gap-2.5 rounded-full bg-background py-1 pl-1 pr-4 text-[15px] shadow-card"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    tone,
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                {t(`home.journey.amenities.${key}`)}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

function StopLabel({
  caption,
  captionClassName,
  stop,
  country,
  className,
}: {
  caption: string;
  captionClassName?: string;
  stop: Stop;
  country: string;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={cn("min-w-0", className)}>
      <p className={cn("type-caption font-semibold", captionClassName)}>
        {caption}
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stop.iata}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: EASE_SOFT }}
        >
          <p className="text-[28px] font-semibold leading-tight tracking-tight tabular-nums md:text-[40px]">
            {stop.iata}
          </p>
          <p className="text-[15px] leading-snug md:text-[17px]">
            {t(`cities.${stop.city}`)}
            <span className="text-muted-foreground">, {country}</span>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
