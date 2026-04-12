import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, LoginRequest, RegisterRequest } from "@/types";
import { authApi } from "@/api/auth.api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenAction: () => Promise<void>;
  setUser: (user: User) => void;
  fetchUser: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (data: LoginRequest) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(data);
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(data);
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Logout even if API call fails
        } finally {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      refreshTokenAction: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;

        try {
          const response = await authApi.refreshToken(refreshToken);
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        } catch {
          get().logout();
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
          get().logout();
        }
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
