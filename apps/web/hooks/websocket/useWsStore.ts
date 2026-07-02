import { create } from "zustand";
import type { Participant } from "@repo/zod/ws-messages";

interface WsState {
  ws: WebSocket | null;
  roomId: string | null;
  isConnected: boolean;
  isInRoom: boolean;
  autoJoinDisabled: boolean;
  participants: Participant[];
  setWs: (ws: WebSocket | null) => void;
  setRoomId: (roomId: string | null) => void;
  setIsConnected: (status: boolean) => void;
  setIsInRoom: (status: boolean) => void;
  setAutoJoinDisabled: (disabled: boolean) => void;
  setParticipants: (participants: Participant[]) => void;
  resetSession: () => void;
}

export const useWsStore = create<WsState>((set) => ({
  ws: null,
  roomId: null,
  isConnected: false,
  isInRoom: false,
  autoJoinDisabled: false,
  participants: [],
  setWs: (ws) => set({ ws }),
  setRoomId: (roomId) => set({ roomId }),
  setIsConnected: (status) => set({ isConnected: status }),
  setIsInRoom: (status) => set({ isInRoom: status }),
  setAutoJoinDisabled: (disabled) => set({ autoJoinDisabled: disabled }),
  setParticipants: (participants) => set({ participants }),
  resetSession: () =>
    set({
      ws: null,
      roomId: null,
      isConnected: false,
      isInRoom: false,
      participants: [],
    }),
}));
