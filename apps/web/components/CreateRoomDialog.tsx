"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Play, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "./ui/dialog";
import { useRoomDialog } from "@/hooks/useRoomDialog";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useWsStore } from "@/hooks/useWsStore";
import { toast } from "sonner";

export default function CreateRoomDialog() {
  const { open, setOpen } = useRoomDialog();
  const { isLoggedIn, user, token } = useAuthStore();

  const { ws, isConnected, setIsConnected, setWs, setRoomId } = useWsStore();

  const [roomId, setLocalRoomId] = useState<string>("");

  const handleStartSession = async () => {
    if (!isLoggedIn) {
      toast.error("Please login first!");
      return;
    }

    if (!token) return toast.error("No JWT token found");

    try {
      // 1️⃣ Create room via backend API using Axios
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/create-room`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;

      if (!data.success) {
        toast.error("Failed to create room");
        return;
      }

      const newRoomId = data.data.id;
      setLocalRoomId(newRoomId);

      // 2️⃣ Connect to WebSocket with the created room
      const websocket = new WebSocket(
        `ws://localhost:8080?token=${token}&room=${newRoomId}`
      );

      websocket.onopen = () => {
        console.log("Connected to WebSocket server as", user?.name);
        websocket.send(
          JSON.stringify({ type: "JOIN_ROOM", roomId: newRoomId })
        );
        setIsConnected(true);
        setWs(websocket);
        setRoomId(newRoomId);
        toast.success("Connected to session!");
      };

      websocket.onclose = () => {
        setIsConnected(false);
        setWs(null);
        setRoomId(null);
        setLocalRoomId("");
      };

      websocket.onerror = () => {
        setIsConnected(false);
        setWs(null);
        setRoomId(null);
        setLocalRoomId("");
        toast.error("WebSocket connection failed!");
      };

      websocket.onmessage = (event) =>
        console.log("Message from server:", event.data);

      setWs(websocket);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          "Something went wrong while starting session"
      );
    }
  };

  const handleShareRoom = () => {
    if (!roomId) return toast.error("Start a session first!");
    const shareUrl = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Room URL copied to clipboard!");
  };

  const handleCloseSession = () => {
    if (ws && roomId) {
      ws.send(JSON.stringify({ type: "LEAVE_ROOM", roomId }));
      ws.close();
      setIsConnected(false);
      setWs(null);
      setRoomId(null);
      setLocalRoomId("");
      toast.success("Room closed successfully!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="bg-black/40 backdrop-blur-sm fixed inset-0 flex items-center justify-center" />
      <DialogContent className="w-[90%] max-w-lg mx-auto rounded-xl border border-dialog-border-color shadow-lg bg-white dark:bg-richblack-900 p-6 sm:p-8 space-y-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center font-bold text-xl sm:text-2xl text-color-primary tracking-wide">
            Live Collaboration
          </DialogTitle>
          <p className="text-center text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300">
            Invite people to collaborate on your drawing in real-time. This
            session is{" "}
            <span className="font-semibold text-color-primary">
              end-to-end encrypted
            </span>
            .
          </p>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isConnected ? (
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto py-3 px-6 rounded-lg text-sm font-semibold text-white shadow-md transition-transform active:scale-[.98]"
              style={{
                background:
                  "linear-gradient(to right, #8d8bd6 0%, #8d8bd6 100%)",
              }}
              onClick={handleStartSession}
            >
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-white" />
                Start Session
              </div>
            </Button>
          ) : (
            <>
              {roomId && (
                <Button
                  type="button"
                  size="lg"
                  className="w-full sm:w-auto py-3 px-6 rounded-lg text-sm font-semibold text-white shadow-md bg-green-600 hover:bg-green-700"
                  onClick={handleShareRoom}
                >
                  Share Room
                </Button>
              )}
              <Button
                type="button"
                size="lg"
                className="w-full sm:w-auto py-3 px-6 rounded-lg text-sm font-semibold text-white shadow-md bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                onClick={handleCloseSession}
              >
                <XCircle className="w-5 h-5 text-white" />
                Close Session
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
