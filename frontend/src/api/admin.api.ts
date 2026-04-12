import apiClient from "@/api/client";

export interface AdminDashboardStats {
  totalUsers: number;
  totalFlights: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userEmail: string | null;
  details: string | null;
  createdAt: string;
}

export interface AdminPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export const adminApi = {
  getDashboard: async (): Promise<AdminDashboardStats> => {
    const response = await apiClient.get<AdminDashboardStats>(
      "/admin/dashboard"
    );
    return response.data;
  },

  getBookings: async (page = 0, size = 20): Promise<AdminPage<unknown>> => {
    const response = await apiClient.get<AdminPage<unknown>>(
      "/admin/bookings",
      { params: { page, size } }
    );
    return response.data;
  },

  getAuditLogs: async (
    page = 0,
    size = 50
  ): Promise<AdminPage<AdminAuditLog>> => {
    const response = await apiClient.get<AdminPage<AdminAuditLog>>(
      "/admin/audit-logs",
      { params: { page, size } }
    );
    return response.data;
  },
};
