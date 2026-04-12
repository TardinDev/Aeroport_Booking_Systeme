import apiClient from "@/api/client";
import type { ApiResponse, PaymentIntent, PaymentStatus } from "@/types";

export interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  createdAt: string;
}

export const paymentsApi = {
  createPaymentIntent: async (data: {
    bookingId: string;
    amount: number;
    currency: string;
  }): Promise<PaymentIntent> => {
    const response = await apiClient.post<ApiResponse<PaymentIntent>>(
      "/payments/intent",
      data
    );
    return response.data.data;
  },

  confirmPayment: async (data: {
    paymentIntentId: string;
    bookingId: string;
  }): Promise<{ success: boolean; status: PaymentStatus }> => {
    const response = await apiClient.post<
      ApiResponse<{ success: boolean; status: PaymentStatus }>
    >("/payments/confirm", data);
    return response.data.data;
  },

  getPaymentHistory: async (): Promise<PaymentRecord[]> => {
    const response = await apiClient.get<ApiResponse<PaymentRecord[]>>(
      "/payments/history"
    );
    return response.data.data;
  },

  getPaymentByBookingId: async (
    bookingId: string
  ): Promise<PaymentRecord> => {
    const response = await apiClient.get<ApiResponse<PaymentRecord>>(
      `/payments/booking/${bookingId}`
    );
    return response.data.data;
  },

  requestRefund: async (data: {
    paymentId: string;
    reason: string;
  }): Promise<{ success: boolean; refundId: string }> => {
    const response = await apiClient.post<
      ApiResponse<{ success: boolean; refundId: string }>
    >("/payments/refund", data);
    return response.data.data;
  },
};
