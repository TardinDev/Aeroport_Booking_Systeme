import apiClient from "@/api/client";
import type { DestinationInsights } from "@/types";

export const destinationsApi = {
  getInsights: async (iata: string): Promise<DestinationInsights> => {
    const response = await apiClient.get<DestinationInsights>(
      `/destinations/${encodeURIComponent(iata.toUpperCase())}/insights`
    );
    return response.data;
  },
};
