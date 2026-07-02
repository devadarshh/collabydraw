"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWsStore } from "./useWsStore";

export const intentionalLeaveRef = { current: false };

export function useLeaveRoom() {
  const router = useRouter();
  const {
    ws,
    roomId,
    isConnected,
    setWs,
    setRoomId,
    setIsConnected,
    setParticipants,
  } = useWsStore();

  const leaveRoom = useCallback(() => {
    if (!ws || !roomId) {
      toast.error("You are not in a room");
      return;
    }

    intentionalLeaveRef.current = true;
    ws.send(JSON.stringify({ type: "LEAVE_ROOM", roomId }));
    ws.close();
    setIsConnected(false);
    setWs(null);
    setRoomId(null);
    setParticipants([]);
    router.replace("/");
    toast.success("Left the room successfully!");
  }, [
    ws,
    roomId,
    router,
    setIsConnected,
    setWs,
    setRoomId,
    setParticipants,
  ]);

  return { leaveRoom, roomId, isConnected };
}
