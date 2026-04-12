import { create } from "zustand";
import type {
  ArrivalTransport,
  BookingService,
  Flight,
  Passenger,
  Seat,
} from "@/types";

export type BookingStep =
  | "SEARCH"
  | "SELECT_FLIGHT"
  | "SELECT_SEATS"
  | "PASSENGER_INFO"
  | "ARRIVAL_TRANSPORT"
  | "SERVICES"
  | "PAYMENT"
  | "CONFIRMATION";

const STEP_ORDER: BookingStep[] = [
  "SEARCH",
  "SELECT_FLIGHT",
  "SELECT_SEATS",
  "PASSENGER_INFO",
  "ARRIVAL_TRANSPORT",
  "SERVICES",
  "PAYMENT",
  "CONFIRMATION",
];

interface BookingState {
  selectedFlight: Flight | null;
  passengers: Passenger[];
  selectedSeats: Seat[];
  services: BookingService[];
  arrivalTransport: ArrivalTransport | null;
  currentStep: BookingStep;
  bookingId: string | null;
  bookingReference: string | null;
}

interface BookingActions {
  setFlight: (flight: Flight) => void;
  addPassenger: (passenger: Passenger) => void;
  updatePassenger: (index: number, passenger: Passenger) => void;
  removePassenger: (index: number) => void;
  selectSeat: (seat: Seat) => void;
  deselectSeat: (seatId: string) => void;
  addService: (service: BookingService) => void;
  removeService: (serviceType: BookingService["type"]) => void;
  setArrivalTransport: (transport: ArrivalTransport | null) => void;
  setStep: (step: BookingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setBookingId: (id: string) => void;
  setBookingReference: (reference: string) => void;
  reset: () => void;
  getTotalPrice: () => number;
}

type BookingStore = BookingState & BookingActions;

const initialState: BookingState = {
  selectedFlight: null,
  passengers: [],
  selectedSeats: [],
  services: [],
  arrivalTransport: null,
  currentStep: "SEARCH",
  bookingId: null,
  bookingReference: null,
};

export const useBookingStore = create<BookingStore>()((set, get) => ({
  ...initialState,

  setFlight: (flight: Flight) => {
    set({ selectedFlight: flight });
  },

  addPassenger: (passenger: Passenger) => {
    set((state) => ({
      passengers: [...state.passengers, passenger],
    }));
  },

  updatePassenger: (index: number, passenger: Passenger) => {
    set((state) => {
      const passengers = [...state.passengers];
      passengers[index] = passenger;
      return { passengers };
    });
  },

  removePassenger: (index: number) => {
    set((state) => ({
      passengers: state.passengers.filter((_, i) => i !== index),
    }));
  },

  selectSeat: (seat: Seat) => {
    set((state) => {
      const alreadySelected = state.selectedSeats.find(
        (s) => s.id === seat.id
      );
      if (alreadySelected) return state;
      return {
        selectedSeats: [...state.selectedSeats, seat],
      };
    });
  },

  deselectSeat: (seatId: string) => {
    set((state) => ({
      selectedSeats: state.selectedSeats.filter((s) => s.id !== seatId),
    }));
  },

  addService: (service: BookingService) => {
    set((state) => {
      const existing = state.services.find((s) => s.type === service.type);
      if (existing) {
        return {
          services: state.services.map((s) =>
            s.type === service.type ? service : s
          ),
        };
      }
      return {
        services: [...state.services, service],
      };
    });
  },

  removeService: (serviceType: BookingService["type"]) => {
    set((state) => ({
      services: state.services.filter((s) => s.type !== serviceType),
    }));
  },

  setArrivalTransport: (transport: ArrivalTransport | null) => {
    set({ arrivalTransport: transport });
  },

  setStep: (step: BookingStep) => {
    set({ currentStep: step });
  },

  nextStep: () => {
    set((state) => {
      const currentIndex = STEP_ORDER.indexOf(state.currentStep);
      if (currentIndex < STEP_ORDER.length - 1) {
        return { currentStep: STEP_ORDER[currentIndex + 1] };
      }
      return state;
    });
  },

  prevStep: () => {
    set((state) => {
      const currentIndex = STEP_ORDER.indexOf(state.currentStep);
      if (currentIndex > 0) {
        return { currentStep: STEP_ORDER[currentIndex - 1] };
      }
      return state;
    });
  },

  setBookingId: (id: string) => {
    set({ bookingId: id });
  },

  setBookingReference: (reference: string) => {
    set({ bookingReference: reference });
  },

  reset: () => {
    set(initialState);
  },

  getTotalPrice: () => {
    const state = get();
    const flightPrice = state.selectedFlight?.basePrice ?? 0;
    const seatsPrice = state.selectedSeats.reduce(
      (sum, seat) => sum + seat.price,
      0
    );
    const servicesPrice = state.services.reduce(
      (sum, service) => sum + service.price,
      0
    );
    const arrivalTransportPrice = state.arrivalTransport?.price ?? 0;
    const passengerMultiplier = Math.max(state.passengers.length, 1);
    return (
      flightPrice * passengerMultiplier +
      seatsPrice +
      servicesPrice +
      arrivalTransportPrice
    );
  },
}));
