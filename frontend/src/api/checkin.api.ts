import apiClient from "@/api/client";

export interface BoardingPass {
  id: string;
  bookingId: string;
  passengerId: string;
  qrCode: string;
  gate: string;
  boardingGroup: string;
  passenger?: {
    firstName: string;
    lastName: string;
  };
  booking?: {
    bookingReference: string;
    flight?: {
      flightNumber: string;
      originCode: string;
      destinationCode: string;
      departureTime: string;
    };
  };
}

export const checkInApi = {
  checkIn: async (bookingId: string): Promise<BoardingPass[]> => {
    const response = await apiClient.post<BoardingPass[]>(
      `/checkin/${bookingId}`
    );
    return response.data;
  },

  getBoardingPass: async (
    bookingId: string,
    passengerId: string
  ): Promise<BoardingPass> => {
    const response = await apiClient.get<BoardingPass>(
      `/checkin/${bookingId}/boarding-pass/${passengerId}`
    );
    return response.data;
  },

  downloadBoardingPassPdf: async (
    bookingId: string,
    passengerId: string
  ): Promise<Blob> => {
    const response = await apiClient.get(
      `/checkin/${bookingId}/boarding-pass/${passengerId}/pdf`,
      { responseType: "blob" }
    );
    return response.data as Blob;
  },
};
