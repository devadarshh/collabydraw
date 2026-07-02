import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isGuest: boolean;
  _hasHydrated: boolean;
  login: (user: User, token: string) => void;
  enterDemoMode: (user: User, token: string) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      isGuest: false,
      _hasHydrated: false,
      login: (user, token) =>
        set({ user, token, isLoggedIn: true, isGuest: false }),
      enterDemoMode: (user, token) =>
        set({ user, token, isLoggedIn: true, isGuest: true }),
      logout: () =>
        set({ user: null, token: null, isLoggedIn: false, isGuest: false }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
        isGuest: state.isGuest,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
