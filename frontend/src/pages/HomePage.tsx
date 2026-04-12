import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";

import { FlightSearchForm } from "@/components/flights/FlightSearchForm";
import { MagazineHeader } from "@/components/ui/magazine-header";
import { SplitTitle } from "@/components/ui/split-title";
import { DropCap } from "@/components/ui/drop-cap";
import { Postmark } from "@/components/ui/postmark";
import { TicketStub } from "@/components/ui/ticket-stub";
import { DestinationPath } from "@/components/ui/destination-path";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ScrollPlane } from "@/components/ui/scroll-plane";
import { ScrollCar } from "@/components/ui/scroll-car";
import { CurrencySelector } from "@/components/shared/CurrencySelector";
import { PaymentMethods } from "@/components/shared/PaymentMethods";

import { useFlightStore } from "@/stores/useFlightStore";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { formatCurrency } from "@/lib/utils";
import type { FlightSearchParams } from "@/types";

const DESTINATIONS_MARQUEE = [
  "Marrakech",
  "Reykjavík",
  "Kyōto",
  "Santorini",
  "Buenos Aires",
  "Hanoï",
  "Lisbonne",
  "Zanzibar",
  "Istanbul",
  "Bogotá",
  "Hà Giang",
  "Cartagena",
];

const FEATURED_DESTINATIONS = [
  {
    code: "CDG → JFK",
    city: "New York",
    country: "United States",
    nights: "3 nights minimum",
    priceEur: 389,
    note: "The classic crossing. Eight hours above the Atlantic, then the skyline.",
  },
  {
    code: "LHR → HND",
    city: "Tōkyō",
    country: "Japan",
    nights: "7 nights minimum",
    priceEur: 712,
    note: "A quiet morning in Shinjuku, a bowl of ramen before midnight.",
  },
  {
    code: "MAD → EZE",
    city: "Buenos Aires",
    country: "Argentina",
    nights: "10 nights minimum",
    priceEur: 598,
    note: "Tango on cobblestones. Malbec and steak at half past ten.",
  },
];

const TAXI_FEATURES = [
  {
    number: "α.",
    title: "A driver waiting at arrivals",
    lede: "Step out of customs and find your name on a card. The boot is open, the engine is warm, the city is twenty minutes away.",
  },
  {
    number: "β.",
    title: "A cab to rent in the city",
    lede: "Need wheels for a day, a week, a month? Reserve a metered cab in your destination city — same booking, same currency, same trust.",
  },
];

const SERVICES = [
  {
    number: "I.",
    title: "Taxi at the kerb",
    lede: "A driver waits with your name on a card. No hailing, no queuing, no haggling — only the soft thud of the boot closing.",
  },
  {
    number: "II.",
    title: "Baggage, accounted for",
    lede: "Declare your luggage in advance. Avoid the surcharge, the lost-and-found, the uneasy wait at the carousel.",
  },
  {
    number: "III.",
    title: "Check-in on your phone",
    lede: "Forty-eight hours before departure, a boarding pass lands in your inbox. Walk past the queue. Find a coffee.",
  },
  {
    number: "IV.",
    title: "Insured, reassured",
    lede: "Lost passports, delayed flights, an umbrella stolen in Lisbon. Our policies cover the small catastrophes of travel.",
  },
];

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSearchParams = useFlightStore((s) => s.setSearchParams);
  // Subscribe to currency code so all prices below re-render on switch.
  const currency = useCurrencyStore((s) => s.code);
  const heroRef = useRef<HTMLElement>(null);

  const handleSearch = (data: FlightSearchParams) => {
    setSearchParams(data);
    navigate("/flights");
  };

  return (
    <div className="paper-bg grain min-h-screen">
      {/* Scroll-driven plane + taxi — together they spell out
          "Fly & Taxi" without a single word being written. */}
      <ScrollPlane targetRef={heroRef} />
      <ScrollCar targetRef={heroRef} />
      {/* ============================================================
          MASTHEAD — thin dateline
          ============================================================ */}
      <div className="border-b border-ink/40">
        <div className="container mx-auto px-6 py-3">
          <MagazineHeader
            volume="XXIV"
            issue="37"
            edition="PARIS · LISBON · TOKYO"
            date="APRIL · MMXXVI"
            price="€2.50 / $3.00"
          />
        </div>
      </div>

      {/* ============================================================
          HERO — editorial title + search stub
          ============================================================ */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Corner page numbers */}
        <span className="page-corner absolute left-6 top-6 hidden md:block">
          FOLIO · 001
        </span>
        <span className="page-corner absolute right-6 top-6 hidden md:block">
          N° 37 / MMXXVI
        </span>

        <div className="container mx-auto grid grid-cols-1 gap-10 px-6 py-14 lg:grid-cols-12 lg:gap-12 lg:py-24">
          {/* LEFT — Title + lede */}
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="small-caps mb-6 flex items-center gap-3 text-coral"
            >
              <span className="h-px w-10 bg-coral" />
              The travel essay · Departures
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <SplitTitle
                as="h1"
                className="text-6xl leading-[0.88] sm:text-7xl lg:text-[7.5rem]"
                segments={[
                  { text: "The", break: true },
                  { text: "art", italic: true, tone: "coral" },
                  { text: "of", break: true },
                  { text: "taking", italic: true },
                  { text: "off." },
                ]}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-10 max-w-xl"
            >
              <DropCap>
                {t("home.hero.subtitle")} We hunt the cheapest fares across
                one hundred and twenty airlines, stitch together itineraries
                in five hundred cities — and arrange a taxi that meets you at
                arrivals with your name on a placard, or a metered cab to
                rent in the city you've just landed in. All that remains of
                the airport is the window seat.
              </DropCap>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("request-a-flight")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
                className="group link-ink inline-flex items-center gap-3 text-lg text-ink"
              >
                <span className="editorial-italic">Read on</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <span className="h-5 w-px bg-ink/40" />
              {/* Currency picker — sets the display currency for every
                  price across the site, persisted in localStorage. */}
              <CurrencySelector />
              <span className="h-5 w-px bg-ink/40" />
              <span className="small-caps text-ink-faded">
                10 minutes · 4 sections
              </span>
            </motion.div>
          </div>

          {/* RIGHT — Ticket stub with destination path */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 1.5 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:col-span-5"
          >
            <TicketStub perforationAt={68} className="paper-tilt">
              <div className="grid grid-cols-[1fr_auto]">
                {/* Left — main stub */}
                <div className="p-6 lg:p-8">
                  <div className="small-caps mb-4 flex items-center justify-between text-ink-faded">
                    <span>Boarding pass · Specimen</span>
                    <span>FAT · 2026</span>
                  </div>

                  <div className="mb-6 flex items-end justify-between gap-6">
                    <div>
                      <p className="small-caps text-ink-faded">From</p>
                      <p className="display-serif text-4xl">CDG</p>
                      <p className="text-xs text-ink-faded">Paris, FR</p>
                    </div>
                    <DestinationPath className="h-16 w-32 text-coral" />
                    <div className="text-right">
                      <p className="small-caps text-ink-faded">To</p>
                      <p className="display-serif text-4xl">JFK</p>
                      <p className="text-xs text-ink-faded">New York, US</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-t border-dashed border-ink/40 pt-4">
                    <div>
                      <p className="small-caps text-ink-faded">Date</p>
                      <p className="font-mono text-sm">14 · APR · 26</p>
                    </div>
                    <div>
                      <p className="small-caps text-ink-faded">Gate</p>
                      <p className="font-mono text-sm">A · 14</p>
                    </div>
                    <div>
                      <p className="small-caps text-ink-faded">Seat</p>
                      <p className="font-mono text-sm">12 · K</p>
                    </div>
                  </div>
                </div>

                {/* Right — tear-off stub */}
                <div className="flex flex-col items-center justify-between gap-2 bg-ink py-6 pl-5 pr-6 text-paper">
                  <Compass className="h-5 w-5" />
                  <p
                    className="text-xs font-mono uppercase tracking-[0.3em]"
                    style={{ writingMode: "vertical-rl" }}
                  >
                    Fly · Taxi
                  </p>
                  <p className="font-display text-2xl italic">A14</p>
                </div>
              </div>
            </TicketStub>

            {/* Postmark over the ticket */}
            <div className="pointer-events-none absolute -right-4 -top-6 z-20">
              <Postmark
                label="Par Avion"
                sublabel="PARIS · CDG"
                tone="red"
                rotate={-18}
                size="lg"
                className="animate-stamp-land"
              />
            </div>
            <div className="pointer-events-none absolute -bottom-6 -left-6 z-20 hidden sm:block">
              <Postmark
                label="Certified"
                sublabel="MMXXVI"
                tone="navy"
                rotate={8}
                size="sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          DESTINATION MARQUEE — italic serif destinations
          ============================================================ */}
      <div className="rule-top rule-bottom overflow-hidden bg-ink py-6 text-paper">
        <div className="group relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-12 px-6">
            {[...DESTINATIONS_MARQUEE, ...DESTINATIONS_MARQUEE].map(
              (city, i) => (
                <span
                  key={`${city}-${i}`}
                  className="display-serif-italic shrink-0 text-5xl text-paper/80 transition-colors hover:text-coral sm:text-6xl"
                >
                  {city}
                  <span className="mx-8 text-coral">✦</span>
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          REQUEST A FLIGHT — editorial search form
          ============================================================ */}
      <section id="request-a-flight" className="py-20 lg:py-28">
        <div className="container mx-auto grid grid-cols-1 gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="small-caps mb-4 text-coral">Section I</p>
            <h2 className="display-serif mb-6 text-5xl leading-[0.95] sm:text-6xl">
              Request a{" "}
              <span className="display-serif-italic text-coral">flight.</span>
            </h2>
            <p className="body-serif text-pretty">
              Fill in the coupons below as you would on a paper ticket.
              Departure, arrival, dates, party — the essentials of any
              itinerary, no more, no less. We search one hundred and twenty
              airlines on your behalf.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="small-caps text-ink-faded">Est. 2026</span>
              <span className="h-px flex-1 bg-ink/30" />
              <span className="editorial-italic text-ink-faded">
                by the editors
              </span>
            </div>
          </div>

          <ScrollReveal
            as="div"
            className="relative lg:col-span-8"
            amount={0.15}
          >
            <div className="rule-top-thick rule-bottom relative border-x-2 border-ink bg-card p-6 shadow-[8px_8px_0_0_var(--ink)] lg:p-10">
              <div className="small-caps mb-6 flex items-center justify-between text-ink-faded">
                <span>Form № 001 · Travel request</span>
                <span>Received · __ / __ / 26</span>
              </div>
              <FlightSearchForm onSearch={handleSearch} />
            </div>
            <Postmark
              label="Urgent"
              sublabel="Priority"
              tone="red"
              rotate={12}
              className="absolute -right-4 -top-5 z-20"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================================
          BY THE NUMBERS — huge display numerals
          ============================================================ */}
      <section className="border-y-2 border-ink bg-paper-deep py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 flex flex-col items-baseline justify-between gap-4 sm:flex-row">
            <div>
              <p className="small-caps mb-2 text-coral">Section II</p>
              <h2 className="display-serif text-5xl sm:text-6xl">
                By the{" "}
                <span className="display-serif-italic text-coral">
                  numbers.
                </span>
              </h2>
            </div>
            <p className="editorial-italic max-w-md text-ink-faded">
              A small compendium of figures, compiled with modest pride.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-0 divide-y divide-ink/30 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {[
              { value: 10000, suffix: "+", label: "Flights daily" },
              { value: 500, suffix: "+", label: "Destinations" },
              { value: 120, suffix: "+", label: "Partner airlines" },
              { value: 1, suffix: "M+", label: "Travellers served" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-start px-6 py-8 sm:px-8"
              >
                <p className="page-corner mb-3">{`0${i + 1}`.slice(-2)}</p>
                <p className="display-serif tabular text-7xl leading-none text-ink sm:text-8xl">
                  <NumberTicker
                    value={stat.value}
                    suffix={stat.suffix}
                    delay={i * 0.15}
                  />
                </p>
                <p className="mt-3 editorial-italic text-lg text-ink-soft">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED SERVICES — 4 editorial columns with roman numerals
          ============================================================ */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6">
          <div className="mb-14 max-w-2xl">
            <p className="small-caps mb-3 text-coral">Section III</p>
            <h2 className="display-serif text-5xl leading-[0.95] sm:text-6xl">
              Small{" "}
              <span className="display-serif-italic text-coral">
                kindnesses
              </span>
              , at every step.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-0 divide-y-2 divide-ink/80 md:grid-cols-2 md:divide-y-0 md:divide-x-2 lg:grid-cols-4">
            {SERVICES.map((service, i) => (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                viewport={{ once: true, margin: "-10%" }}
                className="group relative flex flex-col px-6 py-8 md:py-0 md:pt-0 md:first:pl-0 md:last:pr-0 lg:px-8"
              >
                <p className="display-serif mb-6 text-6xl text-coral">
                  {service.number}
                </p>
                <h3 className="display-serif mb-3 text-3xl leading-tight">
                  {service.title}
                </h3>
                <p className="body-serif text-sm text-pretty">
                  {service.lede}
                </p>
                <div className="mt-6 flex items-center gap-2 text-ink">
                  <span className="small-caps link-ink">Learn more</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED DESTINATIONS — 3 curated cards with postmarks
          ============================================================ */}
      <section className="border-t-2 border-ink bg-paper-deep py-20 lg:py-28">
        <div className="container mx-auto px-6">
          <div className="mb-14 flex flex-col items-baseline justify-between gap-4 sm:flex-row">
            <div className="max-w-2xl">
              <p className="small-caps mb-3 text-coral">Section IV</p>
              <h2 className="display-serif text-5xl leading-[0.95] sm:text-6xl">
                Three{" "}
                <span className="display-serif-italic text-coral">
                  dispatches
                </span>{" "}
                to consider.
              </h2>
            </div>
            <p className="editorial-italic max-w-sm text-ink-faded">
              Curated by our editors this month. All prices per person,
              return.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {FEATURED_DESTINATIONS.map((dest, i) => (
              <motion.article
                key={dest.city}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                viewport={{ once: true, margin: "-10%" }}
                className="group relative"
              >
                <div className="rule-top-thick border-b border-ink pb-8 pt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-xs tracking-wider text-ink-faded">
                      {dest.code}
                    </span>
                    <span className="small-caps text-coral">№ 0{i + 1}</span>
                  </div>

                  <h3 className="display-serif text-5xl leading-none">
                    {dest.city}
                  </h3>
                  <p className="editorial-italic mt-1 text-ink-faded">
                    {dest.country}
                  </p>

                  <p className="body-serif mt-6 text-sm">{dest.note}</p>

                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="small-caps text-ink-faded">
                        {dest.nights}
                      </p>
                      <p className="display-serif text-2xl text-ink">
                        from {formatCurrency(dest.priceEur, currency)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/flights")}
                      className="group/btn flex items-center gap-2 text-ink link-ink"
                    >
                      <span className="editorial-italic">Read dispatch</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </button>
                  </div>
                </div>

                <Postmark
                  label={dest.code.split(" → ")[1]}
                  sublabel={dest.city}
                  tone={i === 1 ? "navy" : i === 2 ? "gold" : "red"}
                  rotate={i === 1 ? 10 : i === 2 ? -6 : -14}
                  className="absolute -right-2 -top-2 opacity-90 transition-transform duration-500 group-hover:rotate-[-22deg]"
                />
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          TAXI EMPHASIS — the second half of the brand promise
          ============================================================ */}
      <section className="border-t-2 border-ink py-20 lg:py-28">
        <div className="container mx-auto grid grid-cols-1 gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="small-caps mb-4 text-coral">Section V</p>
            <h2 className="display-serif text-5xl leading-[0.95] sm:text-6xl">
              The other half:{" "}
              <span className="display-serif-italic text-coral">
                a taxi
              </span>
              , waiting.
            </h2>
            <p className="body-serif mt-6 text-pretty">
              Anyone can sell you a cheap flight. We do something
              quietly more useful: we make sure a driver is there when
              the cabin doors open. Reserve a meet-and-greet at
              arrivals, or a metered cab to rent in the destination
              city — both attached to the same booking, both billed in
              the currency of your choosing.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="small-caps text-ink-faded">
                Available in 220+ cities
              </span>
              <span className="h-px flex-1 bg-ink/30" />
              <CurrencySelector />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 divide-y-2 divide-ink/80 sm:grid-cols-2 sm:divide-y-0 sm:divide-x-2 lg:col-span-7">
            {TAXI_FEATURES.map((feature, i) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true, margin: "-10%" }}
                className="flex flex-col px-6 py-8 sm:px-8"
              >
                <p className="display-serif mb-6 text-6xl text-coral">
                  {feature.number}
                </p>
                <h3 className="display-serif mb-3 text-3xl leading-tight">
                  {feature.title}
                </h3>
                <p className="body-serif text-sm text-pretty">
                  {feature.lede}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          PAYMENT METHODS — international acceptance strip
          ============================================================ */}
      <section className="border-t-2 border-ink bg-paper-deep py-20 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="mb-12 max-w-2xl">
            <p className="small-caps mb-3 text-coral">Section VI</p>
            <h2 className="display-serif text-5xl leading-[0.95] sm:text-6xl">
              Pay the way{" "}
              <span className="display-serif-italic text-coral">
                you prefer
              </span>
              .
            </h2>
            <p className="body-serif mt-4 text-pretty text-ink-soft">
              From a Visa swipe in Paris to Alipay in Shanghai or M-Pesa
              in Nairobi — we accept the world's payment methods, in any
              of twelve currencies.
            </p>
          </div>
          <PaymentMethods />
        </div>
      </section>

      {/* ============================================================
          CLOSING EDITORIAL NOTE
          ============================================================ */}
      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <p className="small-caps mb-6 text-coral">A closing word</p>
          <p className="display-serif text-3xl leading-snug text-balance sm:text-4xl">
            “Travel makes{" "}
            <span className="display-serif-italic text-coral">
              one modest
            </span>
            . You see what a tiny place you occupy in the world.”
          </p>
          <p className="small-caps mt-6 text-ink-faded">
            — Gustave Flaubert, 1849
          </p>

          <div className="mx-auto mt-10 h-px w-24 bg-ink" />

          <motion.button
            type="button"
            onClick={() =>
              document
                .getElementById("request-a-flight")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            whileHover={{ y: -2 }}
            className="mt-10 inline-flex items-center gap-3 border-2 border-ink bg-paper px-8 py-4 shadow-[4px_4px_0_0_var(--ink)] transition-shadow hover:shadow-[6px_6px_0_0_var(--coral)]"
          >
            <span className="small-caps">Begin your journey</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </section>
    </div>
  );
}
