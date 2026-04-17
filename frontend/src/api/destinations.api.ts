import apiClient from "@/api/client";
import type {
  DestinationEventsResponse,
  DestinationInsights,
} from "@/types";

export const destinationsApi = {
  getInsights: async (iata: string): Promise<DestinationInsights> => {
    const response = await apiClient.get<DestinationInsights>(
      `/destinations/${encodeURIComponent(iata.toUpperCase())}/insights`
    );
    return response.data;
  },

  getEvents: async (iata: string): Promise<DestinationEventsResponse> => {
    const response = await apiClient.get<DestinationEventsResponse>(
      `/destinations/${encodeURIComponent(iata.toUpperCase())}/events`
    );
    return response.data;
  },
};
