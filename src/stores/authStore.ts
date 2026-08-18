import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  token: string | null;
  expiresAt: string | null;
  email: string | null;
  setSession: (token: string, expiresAt: string | null, email: string | null) => void;
  clearSession: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      email: null,
      setSession: (token, expiresAt, email) => set({ token, expiresAt, email }),
      clearSession: () => set({ token: null, expiresAt: null, email: null }),
      isAuthenticated: () => {
        const { token, expiresAt } = get();
        if (!token) return false;
        if (expiresAt && new Date(expiresAt).getTime() < Date.now()) return false;
        return true;
      },
    }),
    {
      name: "qj-customer-session",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
