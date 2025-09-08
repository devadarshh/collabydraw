import { create } from "zustand";

interface WelcomeState {
  showWelcome: boolean;
  hideWelcome: () => void;
}

export const useWelcomeStore = create<WelcomeState>((set) => ({
  showWelcome: true, // default: show welcome on first load
  hideWelcome: () => set({ showWelcome: false }),
}));
