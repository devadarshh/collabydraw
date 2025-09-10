import { create } from "zustand";

interface WsState {
  ws: WebSocket | null;
  roomId: string | null;
  isConnected: boolean;
  setWs: (ws: WebSocket | null) => void;
  setRoomId: (roomId: string | null) => void;
  setIsConnected: (status: boolean) => void;
}

export const useWsStore = create<WsState>((set) => ({
  ws: null,
  roomId: null,
  isConnected: false,
  setWs: (ws) => set({ ws }),
  setRoomId: (roomId) => set({ roomId }),
  setIsConnected: (status) => set({ isConnected: status }),
}));
