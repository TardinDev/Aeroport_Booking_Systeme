// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "USER" | "ADMIN" | "AGENT";
  avatarUrl?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Flight types
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Airline {
  id: string;
  name: string;
  code: string;
  logoUrl: string;
}

export interface Agency {
  id: string;
  name: string;
  logoUrl: string;
}

export type SeatClass = "ECONOMY" | "BUSINESS" | "FIRST";
export type FlightStatus =
  | "SCHEDULED"
  | "DELAYED"
  | "CANCELLED"
  | "BOARDING"
  | "IN_FLIGHT"
  | "LANDED";
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";
export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

/**
 * Flight — mirrors backend FlightResponse exactly (flat fields).
 * The backend flattens airline + origin + destination into scalar
 * fields on purpose, so the frontend does the same.
 */
export interface Flight {
  id: string;
  flightNumber: string;

  // Airline
  airlineName: string;
  airlineCode: string;
  airlineLogo: string | null;

  // Origin airport
  originCode: string;
  originName: string;
  originCity: string;
  originCountry: string;

  // Destination airport
  destinationCode: string;
  destinationName: string;
  destinationCity: string;
  destinationCountry: string;

  departureTime: string;
  arrivalTime: string;
  duration: number; // minutes
  basePrice: number;
  currency: string;
  seatClass: SeatClass;
  totalSeats: number;
  availableSeats: number;
  status: FlightStatus;
  stops: number;

  // Booking redirect + seller metadata
  bookingUrl: string | null;
  sellerName: string | null;
  sellerType: "AIRLINE" | "AGENCY" | null;
  sellerLogoUrl: string | null;
}

/** Backend FlightSearchResponse shape — returned unwrapped by /flights/search. */
export interface FlightSearchResponse {
  flights: Flight[];
  totalResults: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  seatClass: SeatClass;
  tripType: "ONE_WAY" | "ROUND_TRIP";
}

// Seat types
export type SeatStatus = "AVAILABLE" | "OCCUPIED" | "SELECTED" | "BLOCKED";

export interface Seat {
  id: string;
  row: number;
  column: string;
  seatClass: SeatClass;
  status: SeatStatus;
  price: number;
  isWindow: boolean;
  isAisle: boolean;
  isExit: boolean;
}

// Booking types
export interface Passenger {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  passportNumber?: string;
  seatId?: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  flight: Flight;
  passengers: Passenger[];
  status: BookingStatus;
  totalPrice: number;
  currency: string;
  services: BookingService[];
  createdAt: string;
  boardingPassUrl?: string;
}

// Service types
export interface TaxiReservation {
  id: string;
  bookingId: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupTime: string;
  estimatedPrice: number;
  estimatedDuration: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
}

export interface BaggageDeclaration {
  id: string;
  bookingId: string;
  type: "CABIN" | "CHECKED" | "SPECIAL";
  weight: number;
  dimensions: string;
  extraCharge: number;
}

export interface BookingService {
  type: "TAXI" | "BAGGAGE" | "INSURANCE" | "PRIORITY_BOARDING";
  price: number;
  details: Record<string, unknown>;
}

/**
 * Arrival transport — what the traveller wants waiting for them
 * once they land. Either a driver-with-placard pickup, a self-drive
 * rental car booked from the destination airport, or nothing.
 */
export type ArrivalTransportKind = "NONE" | "TAXI_PICKUP" | "CAR_RENTAL";

export interface TaxiPickupDetails {
  meetingPoint: string;
  placardName: string;
  contactPhone: string;
  dropoffAddress: string;
}

export interface CarRentalDetails {
  carClass: "ECONOMY" | "COMPACT" | "SUV" | "PREMIUM";
  pickupDate: string;
  returnDate: string;
  returnLocation: "SAME" | "DIFFERENT";
}

export interface ArrivalTransport {
  kind: ArrivalTransportKind;
  price: number; // EUR
  taxiDetails?: TaxiPickupDetails;
  rentalDetails?: CarRentalDetails;
}

/**
 * Standalone ground-transport offer (no flight attached). Surfaced
 * by the dedicated /transport page. The frontend uses mock data
 * until the backend exposes a real provider.
 */
export type GroundTransportKind = "TAXI_PICKUP" | "CAR_RENTAL";

export interface GroundTransportOffer {
  id: string;
  kind: GroundTransportKind;
  providerName: string;
  providerLogo?: string;
  airportCode: string;
  airportCity: string;
  airportCountry: string;
  vehicleLabel: string;
  capacity: number;
  /** Daily rate for rentals, fixed fare for taxis (in EUR). */
  priceEur: number;
  rating: number;
  highlights: string[];
}

export interface GroundTransportSearchParams {
  kind: GroundTransportKind;
  airport: string;
  pickupDate: string;
  returnDate?: string;
  passengers: number;
}

// Payment types
export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// AI-powered destination concierge
export type SafetyLevel = "LOW" | "MODERATE" | "ELEVATED" | "HIGH";

export interface DestinationInsights {
  iata: string;
  city: string;
  country: string;
  tagline: string;
  safety: {
    level: SafetyLevel;
    summary: string;
    watchouts: string[];
  };
  events: Array<{
    title: string;
    window: string;
    location: string;
    description: string;
  }>;
  mustDo: Array<{
    title: string;
    category: string;
    description: string;
    neighbourhood: string;
  }>;
  dailyTips: Array<{
    icon: string;
    title: string;
    detail: string;
  }>;
  practical: {
    currency: string;
    language: string;
    timezone: string;
    plug: string;
    tipping: string;
    transportTip: string;
  };
  source: "claude" | "stub";
  generatedAt: string;
}
