import { create } from "zustand";
import type { Participant } from "@repo/zod/ws-messages";

interface WsState {
  ws: WebSocket | null;
  roomId: string | null;
  isConnected: boolean;
  isInRoom: boolean;
  autoJoinDisabled: boolean;
  declinedRoomId: string | null;
  connectionGeneration: number;
  participants: Participant[];
  setWs: (ws: WebSocket | null) => void;
  setRoomId: (roomId: string | null) => void;
  setIsConnected: (status: boolean) => void;
  setIsInRoom: (status: boolean) => void;
  setAutoJoinDisabled: (disabled: boolean) => void;
  setDeclinedRoomId: (roomId: string | null) => void;
  setParticipants: (participants: Participant[]) => void;
  resetConnection: () => void;
  clearLeaveGuards: () => void;
  leaveSession: (roomId: string) => void;
}

export const useWsStore = create<WsState>((set) => ({
  ws: null,
  roomId: null,
  isConnected: false,
  isInRoom: false,
  autoJoinDisabled: false,
  declinedRoomId: null,
  connectionGeneration: 0,
  participants: [],
  setWs: (ws) => set({ ws }),
  setRoomId: (roomId) => set({ roomId }),
  setIsConnected: (status) => set({ isConnected: status }),
  setIsInRoom: (status) => set({ isInRoom: status }),
  setAutoJoinDisabled: (disabled) => set({ autoJoinDisabled: disabled }),
  setDeclinedRoomId: (roomId) => set({ declinedRoomId: roomId }),
  setParticipants: (participants) => set({ participants }),
  resetConnection: () =>
    set({
      ws: null,
      roomId: null,
      isConnected: false,
      isInRoom: false,
      participants: [],
    }),
  clearLeaveGuards: () =>
    set({
      autoJoinDisabled: false,
      declinedRoomId: null,
    }),
  leaveSession: (roomId) =>
    set((state) => ({
      declinedRoomId: roomId,
      autoJoinDisabled: true,
      connectionGeneration: state.connectionGeneration + 1,
      ws: null,
      roomId: null,
      isConnected: false,
      isInRoom: false,
      participants: [],
    })),
}));
