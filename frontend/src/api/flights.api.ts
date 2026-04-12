import apiClient from "@/api/client";
import type {
  ApiResponse,
  Flight,
  FlightSearchParams,
  FlightSearchResponse,
  Seat,
} from "@/types";

export const flightsApi = {
  /**
   * Search for flights. The backend returns a FlightSearchResponse
   * directly (NOT wrapped in ApiResponse) with flat flight objects.
   */
  searchFlights: async (
    params: FlightSearchParams,
    page: number = 0,
    size: number = 20,
    sort: string = "price,asc"
  ): Promise<FlightSearchResponse> => {
    const response = await apiClient.get<FlightSearchResponse>(
      "/flights/search",
      {
        params: {
          ...params,
          page,
          size,
          sort,
        },
      }
    );
    return response.data;
  },

  getFlightById: async (id: string): Promise<Flight> => {
    const response = await apiClient.get<Flight>(`/flights/${id}`);
    return response.data;
  },

  getFlightSeats: async (flightId: string): Promise<Seat[]> => {
    const response = await apiClient.get<ApiResponse<Seat[]>>(
      `/flights/${flightId}/seats`
    );
    return response.data.data;
  },

  getPopularFlights: async (): Promise<Flight[]> => {
    const response = await apiClient.get<ApiResponse<Flight[]>>(
      "/flights/popular"
    );
    return response.data.data;
  },

  getAirports: async (
    query: string
  ): Promise<Array<{ code: string; name: string; city: string; country: string }>> => {
    const response = await apiClient.get<
      ApiResponse<Array<{ code: string; name: string; city: string; country: string }>>
    >("/airports/search", {
      params: { q: query },
    });
    return response.data.data;
  },
};
