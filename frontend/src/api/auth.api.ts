import apiClient from "@/api/client";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types";

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data
    );
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );
    return response.data.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data.data;
  },

  updateProfile: async (
    data: Partial<Pick<User, "firstName" | "lastName" | "phone">>
  ): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      "/auth/profile",
      data
    );
    return response.data.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await apiClient.put("/auth/password", data);
  },
};
