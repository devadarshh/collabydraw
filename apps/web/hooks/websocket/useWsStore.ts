import { create } from "zustand";
import type { Participant } from "@repo/zod/ws-messages";

interface WsState {
  ws: WebSocket | null;
  roomId: string | null;
  isConnected: boolean;
  participants: Participant[];
  setWs: (ws: WebSocket | null) => void;
  setRoomId: (roomId: string | null) => void;
  setIsConnected: (status: boolean) => void;
  setParticipants: (participants: Participant[]) => void;
}

export const useWsStore = create<WsState>((set) => ({
  ws: null,
  roomId: null,
  isConnected: false,
  participants: [],
  setWs: (ws) => set({ ws }),
  setRoomId: (roomId) => set({ roomId }),
  setIsConnected: (status) => set({ isConnected: status }),
  setParticipants: (participants) => set({ participants }),
}));
