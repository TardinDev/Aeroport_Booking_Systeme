import apiClient from "@/api/client";
import type {
  ApiResponse,
  BaggageDeclaration,
  TaxiReservation,
} from "@/types";

export interface BookTaxiRequest {
  bookingId: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupTime: string;
}

export interface DeclareBaggageRequest {
  bookingId: string;
  type: "CABIN" | "CHECKED" | "SPECIAL";
  weight: number;
  dimensions: string;
}

export const servicesApi = {
  bookTaxi: async (data: BookTaxiRequest): Promise<TaxiReservation> => {
    const response = await apiClient.post<ApiResponse<TaxiReservation>>(
      "/services/taxi",
      data
    );
    return response.data.data;
  },

  getTaxiReservation: async (
    bookingId: string
  ): Promise<TaxiReservation | null> => {
    const response = await apiClient.get<
      ApiResponse<TaxiReservation | null>
    >(`/services/taxi/${bookingId}`);
    return response.data.data;
  },

  cancelTaxi: async (reservationId: string): Promise<void> => {
    await apiClient.delete(`/services/taxi/${reservationId}`);
  },

  declareBaggage: async (
    data: DeclareBaggageRequest
  ): Promise<BaggageDeclaration> => {
    const response = await apiClient.post<ApiResponse<BaggageDeclaration>>(
      "/services/baggage",
      data
    );
    return response.data.data;
  },

  getBaggageDeclarations: async (
    bookingId: string
  ): Promise<BaggageDeclaration[]> => {
    const response = await apiClient.get<ApiResponse<BaggageDeclaration[]>>(
      `/services/baggage/${bookingId}`
    );
    return response.data.data;
  },

  removeBaggage: async (declarationId: string): Promise<void> => {
    await apiClient.delete(`/services/baggage/${declarationId}`);
  },

  getServicePricing: async (): Promise<{
    taxi: { basePrice: number; perKm: number };
    baggage: {
      cabin: number;
      checked: number;
      special: number;
      extraKgPrice: number;
    };
    insurance: { basic: number; premium: number };
    priorityBoarding: number;
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        taxi: { basePrice: number; perKm: number };
        baggage: {
          cabin: number;
          checked: number;
          special: number;
          extraKgPrice: number;
        };
        insurance: { basic: number; premium: number };
        priorityBoarding: number;
      }>
    >("/services/pricing");
    return response.data.data;
  },
};
