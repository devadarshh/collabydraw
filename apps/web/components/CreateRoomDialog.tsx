"use client";

import { useEffect, useState } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateRoomDialog() {
  const { open, setOpen } = useRoomDialog();
  const { isLoggedIn, user, token } = useAuthStore();
  const { ws, isConnected, setIsConnected, setWs, setRoomId } = useWsStore();
  const [roomId, setLocalRoomId] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get("room");

  // Auto-join if URL has ?room=
  useEffect(() => {
    if (roomFromUrl && isLoggedIn && token && !isConnected) {
      joinRoom(roomFromUrl);
    } else if (roomFromUrl && !isLoggedIn) {
      toast.error("You must be logged in to join this room");
    }
  }, [roomFromUrl, isLoggedIn, token]);

  const joinRoom = async (newRoomId: string) => {
    setLocalRoomId(newRoomId);

    const websocket = new WebSocket(
      `ws://localhost:8080?token=${token}&room=${newRoomId}`
    );

    websocket.onopen = () => {
      websocket.send(JSON.stringify({ type: "JOIN_ROOM", roomId: newRoomId }));
      setIsConnected(true);
      setWs(websocket);
      setRoomId(newRoomId);
      router.replace(`/?room=${newRoomId}`); // update URL
      toast.success(`Joined room ${newRoomId}`);
    };

    websocket.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        console.log("Message from server (non-JSON):", event.data);
        return;
      }

      console.log("Message from server:", msg);

      // Handle messages
      if (msg.type === "USER_LEFT") {
        toast.info(`${msg.userName} left the room`);
      }
      if (msg.type === "ROOM_JOINED") {
        toast.success(msg.message);
      }
      if (msg.type === "LOAD_SHAPES") {
        // load existing shapes on canvas
        console.log("Existing shapes:", msg.shapes);
        // here: renderShapesOnCanvas(msg.shapes);
      }
      if (msg.type === "NEW_SHAPE") {
        // render new shape on canvas
        // renderShapeOnCanvas(msg.shape);
      }
    };

    websocket.onclose = () => {
      setIsConnected(false);
      setWs(null);
      setRoomId(null);
      setLocalRoomId("");
      toast.info("Disconnected from room");
    };

    websocket.onerror = () => {
      setIsConnected(false);
      setWs(null);
      setRoomId(null);
      setLocalRoomId("");
      toast.error("WebSocket connection failed");
    };

    setWs(websocket);
  };

  const handleStartSession = async () => {
    if (!isLoggedIn) return toast.error("Please login first!");
    if (!token) return toast.error("No JWT token found");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/create-room`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data;
      if (!data.success) return toast.error("Failed to create room");

      joinRoom(data.data.id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to start session");
    }
  };

  const handleShareRoom = () => {
    if (!roomId) return toast.error("Start a session first!");
    navigator.clipboard.writeText(window.location.href);
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
      router.replace(`/`);
      toast.success("Left the room successfully!");
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
              className="w-full sm:w-auto py-3 px-6 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
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
