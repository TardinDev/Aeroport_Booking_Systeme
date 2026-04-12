import { create } from "zustand";
import type { Flight, FlightSearchParams, SeatClass } from "@/types";

interface FlightFilters {
  airlines: string[];
  maxStops: number | null;
  priceRange: [number, number] | null;
  departureTimeRange: [string, string] | null;
  sortBy: "price" | "duration" | "departure";
  sortOrder: "asc" | "desc";
}

interface FlightState {
  searchParams: FlightSearchParams;
  flights: Flight[];
  selectedFlight: Flight | null;
  isLoading: boolean;
  filters: FlightFilters;
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

interface FlightActions {
  setSearchParams: (params: Partial<FlightSearchParams>) => void;
  setFlights: (flights: Flight[], total?: number, pages?: number) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  setFilters: (filters: Partial<FlightFilters>) => void;
  setLoading: (isLoading: boolean) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  resetSearch: () => void;
}

type FlightStore = FlightState & FlightActions;

const defaultSearchParams: FlightSearchParams = {
  origin: "",
  destination: "",
  departureDate: "",
  returnDate: undefined,
  passengers: 1,
  seatClass: "ECONOMY" as SeatClass,
  tripType: "ONE_WAY",
};

const defaultFilters: FlightFilters = {
  airlines: [],
  maxStops: null,
  priceRange: null,
  departureTimeRange: null,
  sortBy: "price",
  sortOrder: "asc",
};

export const useFlightStore = create<FlightStore>()((set) => ({
  // State
  searchParams: defaultSearchParams,
  flights: [],
  selectedFlight: null,
  isLoading: false,
  filters: defaultFilters,
  totalResults: 0,
  currentPage: 0,
  totalPages: 0,

  // Actions
  setSearchParams: (params: Partial<FlightSearchParams>) => {
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    }));
  },

  setFlights: (flights: Flight[], total?: number, pages?: number) => {
    set({
      flights,
      totalResults: total ?? flights.length,
      totalPages: pages ?? 1,
      isLoading: false,
    });
  },

  setSelectedFlight: (flight: Flight | null) => {
    set({ selectedFlight: flight });
  },

  setFilters: (filters: Partial<FlightFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setPage: (page: number) => {
    set({ currentPage: page });
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
  },

  resetSearch: () => {
    set({
      searchParams: defaultSearchParams,
      flights: [],
      selectedFlight: null,
      filters: defaultFilters,
      totalResults: 0,
      currentPage: 0,
      totalPages: 0,
    });
  },
}));
