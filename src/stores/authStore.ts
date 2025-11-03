import { create } from "zustand";
import { fetchWithAccess } from "../utils";

export interface User {
  username: string;
  nickname: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasCheckedAuth: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hasCheckedAuth: false,
  login: (userData) => {
    set({ user: userData, isAuthenticated: true, hasCheckedAuth: true });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, isAuthenticated: false, hasCheckedAuth: true });
  },
  checkAuth: async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      set({ user: null, isAuthenticated: false, hasCheckedAuth: true });
      return;
    }

    set((state) => ({
      ...state,
      isAuthenticated: true,
    }));

    try {
      const response = await fetchWithAccess(`${BACKEND_API_BASE_URL}/api/user/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        set({ user: userData, isAuthenticated: true, hasCheckedAuth: true });
        return;
      }
    } catch (error) {
      console.error("사용자 정보 요청 실패:", error);
      // 토큰이 있으나 사용자 정보를 불러오지 못한 경우 기존 상태 유지
    }

    set((state) => ({
      ...state,
      hasCheckedAuth: true,
    }));
  },
}));
