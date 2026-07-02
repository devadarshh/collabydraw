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
  const { isLoggedIn, token } = useAuthStore();
  const {
    ws,
    isConnected,
    setIsConnected,
    setWs,
    setRoomId,
    setParticipants,
  } = useWsStore();
  const [localRoomId, setLocalRoomId] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get("room");

  const { leaveRoom } = useLeaveRoom();
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roomIdRef = useRef<string>("");

  const clearReconnectTimer = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const connectWebSocket = useCallback(
    (newRoomId: string) => {
      if (!token) return;

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080";
      const websocket = new WebSocket(
        `${wsUrl}?token=${token}&room=${newRoomId}`
      );

      websocket.onopen = () => {
        reconnectAttempts.current = 0;
        roomIdRef.current = newRoomId;
        websocket.send(
          JSON.stringify({ type: "JOIN_ROOM", roomId: newRoomId })
        );
        setIsConnected(true);
        setWs(websocket);
        setRoomId(newRoomId);
        setLocalRoomId(newRoomId);
        router.replace(`/?room=${newRoomId}`);
      };

      websocket.onclose = () => {
        setIsConnected(false);
        setWs(null);
        setParticipants([]);

        if (intentionalLeaveRef.current) {
          intentionalLeaveRef.current = false;
          roomIdRef.current = "";
          setRoomId(null);
          setLocalRoomId("");
          toast.info("Disconnected from room");
          return;
        }

        if (
          reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS &&
          roomIdRef.current
        ) {
          const delay =
            BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempts.current;
          reconnectAttempts.current += 1;
          toast.info(`Reconnecting in ${delay / 1000}s...`);
          reconnectTimer.current = setTimeout(() => {
            connectWebSocket(roomIdRef.current);
          }, delay);
        } else {
          roomIdRef.current = "";
          setRoomId(null);
          setLocalRoomId("");
          toast.error("Connection lost. Please rejoin the room.");
        }
      };

      websocket.onerror = () => {
        toast.error("WebSocket connection failed");
      };
    },
    [
      token,
      router,
      setIsConnected,
      setWs,
      setRoomId,
      setParticipants,
    ]
  );

  const joinRoom = useCallback(
    (newRoomId: string) => {
      intentionalLeaveRef.current = false;
      clearReconnectTimer();
      setLocalRoomId(newRoomId);
      connectWebSocket(newRoomId);
    },
    [connectWebSocket]
  );

  useEffect(() => {
    if (roomFromUrl && isLoggedIn && token && !isConnected) {
      joinRoom(roomFromUrl);
    } else if (roomFromUrl && !isLoggedIn) {
      toast.error("You must be logged in to join this room");
    }
  }, [roomFromUrl, isLoggedIn, token, isConnected, joinRoom]);

  useEffect(() => {
    return () => clearReconnectTimer();
  }, []);

  const handleStartSession = async () => {
    if (!isLoggedIn) return toast.error("Please login first!");
    if (!token) return toast.error("No JWT token found");

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
            Invite people to collaborate in real-time. Session is{" "}
            <span className="font-semibold text-color-primary">
              end-to-end encrypted
            </span>
            .
          </p>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isConnected ? (
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
