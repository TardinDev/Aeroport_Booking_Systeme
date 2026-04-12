import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft,
  CalendarDays,
  Loader2,
  MapPin,
  Plane,
  Search,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SeatClass, FlightSearchParams } from "@/types";
import { searchAirports, type AirportEntry } from "@/lib/airports";

const searchSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().optional(),
  passengers: z.number().min(1).max(9),
  seatClass: z.enum(["ECONOMY", "BUSINESS", "FIRST"]),
  tripType: z.enum(["ONE_WAY", "ROUND_TRIP"]),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface FlightSearchFormProps {
  onSearch: (data: FlightSearchParams) => void;
  isLoading?: boolean;
  defaultValues?: Partial<FlightSearchParams>;
  compact?: boolean;
}

export function FlightSearchForm({
  onSearch,
  isLoading = false,
  defaultValues,
  compact = false,
}: FlightSearchFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      origin: defaultValues?.origin ?? "",
      destination: defaultValues?.destination ?? "",
      departureDate: defaultValues?.departureDate ?? "",
      returnDate: defaultValues?.returnDate ?? "",
      passengers: defaultValues?.passengers ?? 1,
      seatClass: defaultValues?.seatClass ?? "ECONOMY",
      tripType: defaultValues?.tripType ?? "ONE_WAY",
    },
  });

  const tripType = watch("tripType");
  const origin = watch("origin");
  const destination = watch("destination");

  // Autocomplete state — controlled open/close per field so clicking a
  // suggestion closes the dropdown without stealing focus from the form.
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  const originSuggestions: AirportEntry[] =
    originOpen && origin ? searchAirports(origin) : [];
  const destinationSuggestions: AirportEntry[] =
    destinationOpen && destination ? searchAirports(destination) : [];

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (originRef.current && !originRef.current.contains(target)) {
        setOriginOpen(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(target)) {
        setDestinationOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const pickOrigin = (airport: AirportEntry) => {
    setValue("origin", airport.iata, { shouldValidate: true });
    setOriginOpen(false);
  };
  const pickDestination = (airport: AirportEntry) => {
    setValue("destination", airport.iata, { shouldValidate: true });
    setDestinationOpen(false);
  };

  const swapCities = () => {
    setValue("origin", destination);
    setValue("destination", origin);
  };

  const onSubmit = (data: SearchFormData) => {
    onSearch(data as FlightSearchParams);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={compact ? "space-y-4" : "space-y-6"}>
        {/* Trip Type Toggle */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant={tripType === "ONE_WAY" ? "default" : "outline"}
            size="sm"
            onClick={() => setValue("tripType", "ONE_WAY")}
          >
            {t("flight.search.oneWay")}
          </Button>
          <Button
            type="button"
            variant={tripType === "ROUND_TRIP" ? "default" : "outline"}
            size="sm"
            onClick={() => setValue("tripType", "ROUND_TRIP")}
          >
            {t("flight.search.roundTrip")}
          </Button>
        </div>

        {/* Origin / Destination */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div className="space-y-2" ref={originRef}>
            <Label htmlFor="origin">
              <MapPin className="inline mr-1 h-4 w-4" />
              {t("flight.search.origin")}
            </Label>
            <div className="relative">
              <Input
                id="origin"
                placeholder="Paris (CDG)"
                autoComplete="off"
                {...register("origin", {
                  onChange: () => setOriginOpen(true),
                })}
                onFocus={() => setOriginOpen(true)}
                className={errors.origin ? "border-destructive" : ""}
              />
              <AnimatePresence>
                {originOpen && originSuggestions.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-auto rounded-md border bg-popover shadow-lg"
                  >
                    {originSuggestions.map((airport) => (
                      <li key={airport.iata}>
                        <button
                          type="button"
                          onClick={() => pickOrigin(airport)}
                          className="flex w-full items-start gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          <Plane className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="truncate font-medium">
                                {airport.city}
                              </span>
                              <span className="font-mono text-xs text-muted-foreground">
                                {airport.iata}
                              </span>
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {airport.airportName} · {airport.country}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            {errors.origin && (
              <p className="text-xs text-destructive">
                {errors.origin.message}
              </p>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={swapCities}
              className="mb-0.5"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="sr-only">{t("flight.search.swap")}</span>
            </Button>
          </motion.div>

          <div className="space-y-2" ref={destinationRef}>
            <Label htmlFor="destination">
              <MapPin className="inline mr-1 h-4 w-4" />
              {t("flight.search.destination")}
            </Label>
            <div className="relative">
              <Input
                id="destination"
                placeholder="New York (JFK)"
                autoComplete="off"
                {...register("destination", {
                  onChange: () => setDestinationOpen(true),
                })}
                onFocus={() => setDestinationOpen(true)}
                className={errors.destination ? "border-destructive" : ""}
              />
              <AnimatePresence>
                {destinationOpen && destinationSuggestions.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-auto rounded-md border bg-popover shadow-lg"
                  >
                    {destinationSuggestions.map((airport) => (
                      <li key={airport.iata}>
                        <button
                          type="button"
                          onClick={() => pickDestination(airport)}
                          className="flex w-full items-start gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          <Plane className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="truncate font-medium">
                                {airport.city}
                              </span>
                              <span className="font-mono text-xs text-muted-foreground">
                                {airport.iata}
                              </span>
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {airport.airportName} · {airport.country}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            {errors.destination && (
              <p className="text-xs text-destructive">
                {errors.destination.message}
              </p>
            )}
          </div>
        </div>

        {/* Dates, Passengers, Class */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departureDate">
              <CalendarDays className="inline mr-1 h-4 w-4" />
              {t("flight.search.departureDate")}
            </Label>
            <Input
              id="departureDate"
              type="date"
              {...register("departureDate")}
              className={errors.departureDate ? "border-destructive" : ""}
            />
            {errors.departureDate && (
              <p className="text-xs text-destructive">
                {errors.departureDate.message}
              </p>
            )}
          </div>

          {tripType === "ROUND_TRIP" && (
            <div className="space-y-2">
              <Label htmlFor="returnDate">
                <CalendarDays className="inline mr-1 h-4 w-4" />
                {t("flight.search.returnDate")}
              </Label>
              <Input
                id="returnDate"
                type="date"
                {...register("returnDate")}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="passengers">
              <Users className="inline mr-1 h-4 w-4" />
              {t("flight.search.passengers")}
            </Label>
            <Select
              defaultValue="1"
              onValueChange={(value) =>
                setValue("passengers", parseInt(value, 10))
              }
            >
              <SelectTrigger id="passengers">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {t("flight.search.passengers")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seatClass">{t("flight.search.class")}</Label>
            <Select
              defaultValue="ECONOMY"
              onValueChange={(value) =>
                setValue("seatClass", value as SeatClass)
              }
            >
              <SelectTrigger id="seatClass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ECONOMY">
                  {t("flight.class.ECONOMY")}
                </SelectItem>
                <SelectItem value="BUSINESS">
                  {t("flight.class.BUSINESS")}
                </SelectItem>
                <SelectItem value="FIRST">
                  {t("flight.class.FIRST")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {t("flight.search.searchButton")}
          </Button>
        </motion.div>
      </div>
    </form>
  );
}
