"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/auth/useAuthStore";
import { useWsStore } from "./useWsStore";

export const intentionalLeaveRef = { current: false };

function clearRoomFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("room")) return;
  url.searchParams.delete("room");
  const nextPath = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", nextPath);
}

export function useLeaveRoom() {
  const router = useRouter();
  const { ws, roomId, isInRoom, leaveSession } = useWsStore();

  const leaveRoom = useCallback(() => {
    if (!roomId && !isInRoom) {
      toast.error("You are not in a room");
      return;
    }

    const activeRoomId = roomId;
    if (!activeRoomId) {
      toast.error("You are not in a room");
      return;
    }

    intentionalLeaveRef.current = true;

    clearRoomFromUrl();
    router.replace("/", { scroll: false });

    if (
      ws &&
      (ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING)
    ) {
      try {
        ws.send(
          JSON.stringify({ type: "LEAVE_ROOM", roomId: activeRoomId })
        );
      } catch {
        // Socket may already be closing.
      }
      ws.close();
    }

    leaveSession(activeRoomId);

    const wasGuest = useAuthStore.getState().isGuest;
    if (wasGuest) {
      useAuthStore.getState().logout();
      toast.success("Demo ended");
    } else {
      toast.success("Left the room successfully!");
    }
  }, [ws, roomId, isInRoom, router, leaveSession]);

  return {
    leaveRoom,
    roomId,
    isInRoom,
    isConnected: useWsStore((state) => state.isConnected),
  };
}
