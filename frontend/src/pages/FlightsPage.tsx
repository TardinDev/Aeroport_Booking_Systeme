import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  PlaneTakeoff,
  SearchX,
} from "lucide-react";

import { FlightSearchForm } from "@/components/flights/FlightSearchForm";
import { FlightCard } from "@/components/flights/FlightCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useFlightStore } from "@/stores/useFlightStore";
import { useBookingStore } from "@/stores/useBookingStore";
import { flightsApi } from "@/api/flights.api";
import type { Flight, FlightSearchParams } from "@/types";
import { usePageMeta } from "@/hooks/usePageMeta";

function FlightSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex-1 flex items-center gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-8 w-24 ml-auto" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FlightsPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("meta.flights.title"), description: t("meta.flights.description") });
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(true);

  const {
    searchParams,
    filters,
    setSearchParams,
    setFilters,
    resetFilters,
  } = useFlightStore();

  const { setFlight, setStep } = useBookingStore();

  const { data, isLoading } = useQuery({
    queryKey: ["flights", searchParams, filters],
    queryFn: () =>
      flightsApi.searchFlights(
        searchParams,
        0,
        20,
        `${filters.sortBy},${filters.sortOrder}`
      ),
    enabled:
      !!searchParams.origin &&
      !!searchParams.destination &&
      !!searchParams.departureDate,
  });

  const flights = data?.flights ?? [];
  const totalResults = data?.totalResults ?? 0;

  const handleSearch = (params: FlightSearchParams) => {
    setSearchParams(params);
  };

  const handleSelectFlight = (flight: Flight) => {
    setFlight(flight);
    setStep("SELECT_SEATS");
    navigate(`/booking/${flight.id}`);
  };

  return (
    <div className="content-wide py-8">
      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="mb-8">
          <CardContent className="p-6">
            <FlightSearchForm
              onSearch={handleSearch}
              isLoading={isLoading}
              defaultValues={searchParams}
              compact
            />
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full lg:w-72 shrink-0"
            >
              <Card className="sticky top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t("flight.filters.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stops */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      {t("flight.filters.stops")}
                    </Label>
                    <div className="space-y-2">
                      {[
                        { value: null, label: t("flight.filters.anyStops") },
                        { value: 0, label: t("flight.filters.directOnly") },
                        { value: 1, label: t("flight.filters.oneStop") },
                      ].map((option) => (
                        <div
                          key={option.label}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            checked={filters.maxStops === option.value}
                            onCheckedChange={() =>
                              setFilters({ maxStops: option.value })
                            }
                          />
                          <span className="text-sm">{option.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Sort */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      {t("flight.sort.title")}
                    </Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) =>
                        setFilters({
                          sortBy: value as "price" | "duration" | "departure",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">
                          {t("flight.sort.price")}
                        </SelectItem>
                        <SelectItem value="duration">
                          {t("flight.sort.duration")}
                        </SelectItem>
                        <SelectItem value="departure">
                          {t("flight.sort.departure")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Departure Time */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      {t("flight.filters.departureTime")}
                    </Label>
                    <div className="space-y-2">
                      {[
                        { label: t("flight.filters.morning"), value: "morning" },
                        {
                          label: t("flight.filters.afternoon"),
                          value: "afternoon",
                        },
                        { label: t("flight.filters.evening"), value: "evening" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center gap-2"
                        >
                          <Checkbox />
                          <span className="text-sm">{option.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={resetFilters}
                  >
                    {t("flight.filters.reset")}
                  </Button>
                </CardContent>
              </Card>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="flex-1 space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="mr-2 h-4 w-4" />
                {t("flight.filters.title")}
              </Button>
              <h2 className="text-lg font-semibold">
                {t("flight.results.title")}
              </h2>
              {!isLoading && (
                <span className="text-sm text-muted-foreground">
                  {t("flight.results.found", { count: totalResults })}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split("-") as [
                    "price" | "duration" | "departure",
                    "asc" | "desc",
                  ];
                  setFilters({ sortBy, sortOrder });
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">
                    {t("flight.sort.price")} (ASC)
                  </SelectItem>
                  <SelectItem value="price-desc">
                    {t("flight.sort.price")} (DESC)
                  </SelectItem>
                  <SelectItem value="duration-asc">
                    {t("flight.sort.duration")} (ASC)
                  </SelectItem>
                  <SelectItem value="departure-asc">
                    {t("flight.sort.departure")} (ASC)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <FlightSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Flight Cards */}
          {!isLoading && flights.length > 0 && (
            <div className="space-y-4">
              {flights.map((flight, index) => (
                <motion.div
                  key={flight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FlightCard
                    flight={flight}
                    onSelect={handleSelectFlight}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && flights.length === 0 && searchParams.origin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">
                {t("flight.results.noResults")}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {t("flight.results.tryAgain")}
              </p>
            </motion.div>
          )}

          {/* Initial state - no search performed */}
          {!isLoading && !searchParams.origin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <PlaneTakeoff className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">
                {t("home.hero.title")}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {t("home.hero.subtitle")}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
