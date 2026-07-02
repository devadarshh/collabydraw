"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { Play, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "../ui/dialog";
import { useRoomDialog } from "@/hooks/websocket/useRoomDialog";
import { useAuthStore } from "@/hooks/auth/useAuthStore";
import { useDemoSession } from "@/hooks/auth/useDemoSession";
import { useWsStore } from "@/hooks/websocket/useWsStore";
import {
  intentionalLeaveRef,
  useLeaveRoom,
} from "@/hooks/websocket/useRoomSession";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 1000;

function CreateRoomDialogContent() {
  const { open, setOpen } = useRoomDialog();
  const { token, _hasHydrated } = useAuthStore();
  const { joinAsGuest } = useDemoSession();
  const {
    ws,
    isInRoom,
    autoJoinDisabled,
    declinedRoomId,
    connectionGeneration,
    setIsConnected,
    setIsInRoom,
    setWs,
    setRoomId,
    setParticipants,
    resetConnection,
    clearLeaveGuards,
  } = useWsStore();
  const [localRoomId, setLocalRoomId] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get("room");

  const { leaveRoom } = useLeaveRoom();
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roomIdRef = useRef<string>("");
  const guestJoinAttempted = useRef(false);
  const connectionGenerationRef = useRef(0);

  const clearReconnectTimer = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const shouldBlockRoomJoin = useCallback((roomId: string) => {
    const state = useWsStore.getState();
    return (
      state.autoJoinDisabled ||
      state.declinedRoomId === roomId
    );
  }, []);

  const connectWebSocket = useCallback(
    (newRoomId: string) => {
      if (shouldBlockRoomJoin(newRoomId)) return;

      const currentToken = useAuthStore.getState().token;
      if (!currentToken) return;

      const existingWs = useWsStore.getState().ws;
      if (
        existingWs &&
        (existingWs.readyState === WebSocket.OPEN ||
          existingWs.readyState === WebSocket.CONNECTING)
      ) {
        intentionalLeaveRef.current = true;
        existingWs.close();
        setWs(null);
      }

      const generationAtConnect = useWsStore.getState().connectionGeneration;
      connectionGenerationRef.current = generationAtConnect;

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080";
      const websocket = new WebSocket(
        `${wsUrl}?token=${currentToken}&room=${newRoomId}`
      );

      websocket.onopen = () => {
        if (
          shouldBlockRoomJoin(newRoomId) ||
          useWsStore.getState().connectionGeneration !== generationAtConnect
        ) {
          websocket.close();
          return;
        }

        reconnectAttempts.current = 0;
        roomIdRef.current = newRoomId;
        setWs(websocket);
        setRoomId(newRoomId);
        setLocalRoomId(newRoomId);
        websocket.send(
          JSON.stringify({ type: "JOIN_ROOM", roomId: newRoomId })
        );

        if (!window.location.search.includes(`room=${newRoomId}`)) {
          router.replace(`/?room=${newRoomId}`);
        }
      };

      websocket.onclose = () => {
        setIsConnected(false);
        setIsInRoom(false);
        setWs(null);

        if (
          intentionalLeaveRef.current ||
          useWsStore.getState().autoJoinDisabled ||
          useWsStore.getState().connectionGeneration !== generationAtConnect
        ) {
          intentionalLeaveRef.current = false;
          roomIdRef.current = "";
          setLocalRoomId("");
          setParticipants([]);
          return;
        }

        if (
          reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS &&
          roomIdRef.current &&
          !shouldBlockRoomJoin(roomIdRef.current)
        ) {
          const delay =
            BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempts.current;
          reconnectAttempts.current += 1;
          const roomToReconnect = roomIdRef.current;
          toast.info(`Reconnecting in ${delay / 1000}s...`);
          reconnectTimer.current = setTimeout(() => {
            if (
              useWsStore.getState().connectionGeneration !== generationAtConnect
            ) {
              return;
            }
            connectWebSocket(roomToReconnect);
          }, delay);
        } else {
          roomIdRef.current = "";
          resetConnection();
          setLocalRoomId("");
          toast.error("Connection lost. Please rejoin the room.");
        }
      };

      websocket.onerror = () => {
        toast.error("WebSocket connection failed");
      };
    },
    [
      router,
      resetConnection,
      setIsConnected,
      setIsInRoom,
      setWs,
      setRoomId,
      setParticipants,
      shouldBlockRoomJoin,
    ]
  );

  const joinRoom = useCallback(
    (newRoomId: string) => {
      if (shouldBlockRoomJoin(newRoomId)) return;

      intentionalLeaveRef.current = false;
      clearReconnectTimer();
      setLocalRoomId(newRoomId);
      connectWebSocket(newRoomId);
    },
    [connectWebSocket, shouldBlockRoomJoin]
  );

  useEffect(() => {
    if (!roomFromUrl) {
      clearLeaveGuards();
      guestJoinAttempted.current = false;
      roomIdRef.current = "";
      return;
    }

    setOpen(false);
  }, [roomFromUrl, setOpen, clearLeaveGuards]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!roomFromUrl || autoJoinDisabled || declinedRoomId === roomFromUrl) {
      return;
    }

    if (token && !isInRoom && !ws) {
      joinRoom(roomFromUrl);
      return;
    }

    if (!token && !isInRoom && !ws && !guestJoinAttempted.current) {
      guestJoinAttempted.current = true;
      joinAsGuest(roomFromUrl)
        .then((roomId) => joinRoom(roomId))
        .catch((err: unknown) => {
          guestJoinAttempted.current = false;
          const message =
            axios.isAxiosError(err) && err.response?.data?.message
              ? String(err.response.data.message)
              : "Failed to join room as guest";
          toast.error(message);
        });
    }
  }, [
    _hasHydrated,
    roomFromUrl,
    token,
    isInRoom,
    ws,
    autoJoinDisabled,
    declinedRoomId,
    joinRoom,
    joinAsGuest,
  ]);

  useEffect(() => {
    if (autoJoinDisabled || declinedRoomId) {
      clearReconnectTimer();
      roomIdRef.current = "";
    }
  }, [autoJoinDisabled, declinedRoomId, connectionGeneration]);

  useEffect(() => {
    return () => clearReconnectTimer();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const { ws: activeWs, roomId: activeRoomId, isInRoom: inRoom } =
        useWsStore.getState();
      if (
        !inRoom ||
        !activeRoomId ||
        !activeWs ||
        activeWs.readyState !== WebSocket.OPEN
      ) {
        return;
      }

      intentionalLeaveRef.current = true;
      try {
        activeWs.send(
          JSON.stringify({ type: "LEAVE_ROOM", roomId: activeRoomId })
        );
      } catch {
        // Tab is closing.
      }
      activeWs.close();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleStartSession = async () => {
    clearLeaveGuards();
    guestJoinAttempted.current = false;

    if (!token) {
      try {
        const roomId = await joinAsGuest();
        joinRoom(roomId);
      } catch (err: unknown) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? String(err.response.data.message)
            : "Failed to start demo session";
        toast.error(message);
      }
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/create-room`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data;
      if (!data.success) return toast.error("Failed to create room");

      joinRoom(data.data.id);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Failed to start session";
      toast.error(message);
    }
  };

  const handleShareRoom = () => {
    if (!localRoomId) return toast.error("Start a session first!");
    navigator.clipboard.writeText(window.location.href);
    toast.success("Room URL copied to clipboard!");
  };

  const handleCloseSession = () => {
    clearReconnectTimer();
    roomIdRef.current = "";
    leaveRoom();
    setLocalRoomId("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="bg-black/40 backdrop-blur-sm fixed inset-0 flex items-center justify-center" />
      <DialogContent className="w-[90%] max-w-lg mx-auto rounded-xl border border-dialog-border-color shadow-lg p-6 sm:p-8 space-y-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center font-bold text-xl sm:text-2xl text-color-primary tracking-wide">
            Live Collaboration
          </DialogTitle>
          <p className="text-center text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300">
            Invite people to collaborate in real-time. No account needed for
            demo — share the room link and draw together.
          </p>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isInRoom ? (
            <Button
              onClick={handleStartSession}
              size="lg"
              className="w-full sm:w-auto py-3 px-6 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Session
            </Button>
          ) : (
            <>
              <Button
                onClick={handleShareRoom}
                size="lg"
                className="w-full sm:w-auto py-3 px-6 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700"
              >
                Share Room
              </Button>
              <Button
                onClick={handleCloseSession}
                size="lg"
                className="w-full sm:w-auto py-3 px-6 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Leave Room
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CreateRoomDialog() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateRoomDialogContent />
    </Suspense>
  );
}
