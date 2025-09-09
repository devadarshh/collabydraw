import { create } from "zustand";

interface RoomDialogState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useRoomDialog = create<RoomDialogState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
