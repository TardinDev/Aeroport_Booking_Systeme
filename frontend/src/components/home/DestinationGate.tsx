import { useMemo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";

import { AIRPORTS } from "@/lib/airports";
import { cn } from "@/lib/utils";

interface DestinationGateProps {
  onSelect: (iata: string, city: string) => void;
  selected?: { iata: string; city: string } | null;
  onReset?: () => void;
}

type AirportMatch = {
  iata: string;
  city: string;
  country: string;
};

/**
 * DestinationGate — the editorial "Where are you going?" entry gate.
 * Collapsed chip mode when a destination is already selected.
 */
export function DestinationGate({
  onSelect,
  selected,
  onReset,
}: DestinationGateProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<AirportMatch | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const matches: AirportMatch[] = useMemo(() => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    return AIRPORTS.filter(
      (a) =>
        a.iata.toLowerCase().startsWith(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    )
      .slice(0, 6)
      .map((a) => ({ iata: a.iata, city: a.city, country: a.country }));
  }, [query]);

  const commitSelection = () => {
    if (pending) {
      onSelect(pending.iata, pending.city);
      setOpen(false);
    }
  };

  const handlePick = (m: AirportMatch) => {
    setPending(m);
    setQuery(`${m.city} · ${m.iata}`);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (pending) {
        commitSelection();
      } else if (matches.length > 0) {
        handlePick(matches[0]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setQuery("");
      setPending(null);
      setOpen(false);
    }
  };

  // Collapsed mode: city chip + reset link.
  if (selected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center gap-4"
      >
        <p className="small-caps text-coral">{t("events.gate.eyebrow")}</p>
        <span className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-4 py-2 text-paper shadow-[3px_3px_0_0_var(--coral)]">
          <span className="display-serif text-xl leading-none">
            {selected.city}
          </span>
          <span className="font-mono text-xs tracking-wider opacity-80">
            · {selected.iata}
          </span>
        </span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="group link-ink inline-flex items-center gap-2 text-sm text-ink"
          >
            <span className="editorial-italic">{t("events.gate.reset")}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="small-caps mb-6 flex items-center gap-3 text-coral"
      >
        <span className="h-px w-10 bg-coral" />
        {t("events.gate.eyebrow")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="display-serif text-6xl leading-[0.9] sm:text-7xl lg:text-[6.5rem]">
          {t("events.gate.title")}
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="body-serif mt-8 max-w-xl text-pretty text-lg text-ink-soft"
      >
        {t("events.gate.subtitle")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-10 max-w-xl"
      >
        <div
          className={cn(
            "flex items-center gap-2 border-2 border-ink bg-paper px-4 py-3 shadow-[4px_4px_0_0_var(--ink)] transition-shadow",
            open && "shadow-[5px_5px_0_0_var(--coral)]"
          )}
        >
          <Search className="h-5 w-5 text-ink-faded" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPending(null);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={t("events.gate.placeholder")}
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-ink-faded/60"
            aria-label={t("events.gate.placeholder")}
            aria-expanded={open && matches.length > 0}
            aria-autocomplete="list"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setPending(null);
                setOpen(false);
              }}
              aria-label={t("events.gate.reset")}
              className="text-ink-faded hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Autocomplete dropdown */}
        <AnimatePresence>
          {open && matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              role="listbox"
              className="absolute left-0 right-0 z-30 mt-2 max-w-xl border-2 border-ink bg-paper shadow-[6px_6px_0_0_var(--ink)]"
            >
              {matches.map((m) => (
                <button
                  key={m.iata}
                  type="button"
                  role="option"
                  aria-selected={pending?.iata === m.iata}
                  onClick={() => handlePick(m)}
                  className="flex w-full items-baseline justify-between border-b border-ink/20 px-4 py-3 text-left transition-colors last:border-0 hover:bg-ink/5"
                >
                  <div>
                    <p className="display-serif text-lg leading-none">
                      {m.city}
                    </p>
                    <p className="editorial-italic mt-1 text-xs text-ink-faded">
                      {m.country}
                    </p>
                  </div>
                  <span className="font-mono text-xs tracking-wider text-ink-faded">
                    {m.iata}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center gap-4">
          <motion.button
            type="button"
            onClick={commitSelection}
            disabled={!pending}
            whileHover={pending ? { y: -2 } : undefined}
            whileTap={pending ? { scale: 0.98 } : undefined}
            className={cn(
              "group inline-flex items-center gap-3 border-2 border-ink px-6 py-3 transition-shadow",
              pending
                ? "bg-ink text-paper shadow-[4px_4px_0_0_var(--coral)] hover:shadow-[6px_6px_0_0_var(--coral)]"
                : "cursor-not-allowed bg-paper text-ink-faded opacity-60 shadow-[4px_4px_0_0_var(--ink)]/30"
            )}
          >
            <span className="small-caps">{t("events.gate.cta")}</span>
            <ArrowRight
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                pending && "group-hover:translate-x-1"
              )}
            />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
