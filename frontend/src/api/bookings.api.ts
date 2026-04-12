import apiClient from "@/api/client";
import type {
  ApiResponse,
  Booking,
  BookingService,
  PaginatedResponse,
  Passenger,
} from "@/types";

export interface CreateBookingRequest {
  flightId: string;
  passengers: Passenger[];
  seatIds: string[];
  services: BookingService[];
}

export const bookingsApi = {
  createBooking: async (data: CreateBookingRequest): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>(
      "/bookings",
      data
    );
    return response.data.data;
  },

  getBookings: async (
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Booking>>
    >("/bookings", {
      params: { page, size },
    });
    return response.data.data;
  },

  getBookingById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<ApiResponse<Booking>>(
      `/bookings/${id}`
    );
    return response.data.data;
  },

  getBookingByReference: async (reference: string): Promise<Booking> => {
    const response = await apiClient.get<ApiResponse<Booking>>(
      `/bookings/reference/${reference}`
    );
    return response.data.data;
  },

  cancelBooking: async (id: string): Promise<Booking> => {
    const response = await apiClient.put<ApiResponse<Booking>>(
      `/bookings/${id}/cancel`
    );
    return response.data.data;
  },

  checkIn: async (
    id: string,
    passengerIds: string[]
  ): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>(
      `/bookings/${id}/check-in`,
      { passengerIds }
    );
    return response.data.data;
  },

  downloadBoardingPass: async (
    bookingId: string,
    passengerId: string
  ): Promise<Blob> => {
    const response = await apiClient.get(
      `/bookings/${bookingId}/boarding-pass/${passengerId}`,
      { responseType: "blob" }
    );
    return response.data;
  },
};
