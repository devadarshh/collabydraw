// hooks/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null; // ✅ store JWT
  isLoggedIn: boolean;
  login: (user: User, token: string) => void; // updated to accept token
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      login: (user, token) => set({ user, token, isLoggedIn: true }),
      logout: () => set({ user: null, token: null, isLoggedIn: false }),
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);
