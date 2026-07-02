"use client";

import { useEffect, useRef } from "react";
import type { Canvas } from "fabric";
import { toast } from "sonner";
import type { FabricShapeJSON, ServerMessage } from "@repo/zod/ws-messages";
import { useAuthStore } from "@/hooks/auth/useAuthStore";
import { useCanvasStore } from "@/hooks/canvas/useCanvasStore";
import { useWsStore } from "@/hooks/websocket/useWsStore";
import {
  applyShapeToCanvas,
  applyShapesToCanvas,
  deleteShapeFromCanvas,
} from "@/hooks/websocket/canvasShapeSync";

type PendingSync =
  | { type: "LOAD_SHAPES"; shapes: FabricShapeJSON[] }
  | { type: "NEW_SHAPE"; shape: FabricShapeJSON }
  | { type: "DELETE_SHAPE"; shapeId: string };

export const useWebSocketManager = () => {
  const { canvas } = useCanvasStore();
  const { ws, setParticipants, setIsInRoom, setIsConnected } = useWsStore();
  const joinedWsRef = useRef<WebSocket | null>(null);
  const pendingSyncRef = useRef<PendingSync[]>([]);

  const flushPendingSync = async (targetCanvas: Canvas) => {
    const pending = pendingSyncRef.current.splice(0);
    for (const item of pending) {
      if (item.type === "LOAD_SHAPES") {
        await applyShapesToCanvas(targetCanvas, item.shapes);
      } else if (item.type === "NEW_SHAPE") {
        await applyShapeToCanvas(targetCanvas, item.shape);
      } else if (item.type === "DELETE_SHAPE") {
        deleteShapeFromCanvas(targetCanvas, item.shapeId);
      }
    }
  };

  useEffect(() => {
    if (!ws) return;

    joinedWsRef.current = null;
    pendingSyncRef.current = [];

    const handleMessage = (event: MessageEvent) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(event.data) as ServerMessage;
      } catch {
        return;
      }

      const activeCanvas = useCanvasStore.getState().canvas;
      const currentUserId = useAuthStore.getState().user?.id;

      switch (msg.type) {
        case "ROOM_JOINED": {
          const isFirstJoinForSocket = joinedWsRef.current !== ws;
          joinedWsRef.current = ws;
          setIsInRoom(true);
          setIsConnected(true);
          setParticipants(msg.participants);
          if (isFirstJoinForSocket && activeCanvas) {
            activeCanvas.clear();
            activeCanvas.backgroundColor =
              document.documentElement.classList.contains("dark")
                ? "#121212"
                : "#ffffff";
          }
          break;
        }

        case "USER_JOINED":
          setParticipants(msg.participants);
          if (msg.userId !== currentUserId) {
            toast.info(`${msg.userName} joined the room`);
          }
          break;

        case "USER_LEFT":
          setParticipants(msg.participants);
          if (msg.userId !== currentUserId) {
            toast.info(`${msg.userName} left the room`);
          }
          break;

        case "LOAD_SHAPES":
          if (activeCanvas) {
            void applyShapesToCanvas(activeCanvas, msg.shapes);
          } else {
            pendingSyncRef.current.push({ type: "LOAD_SHAPES", shapes: msg.shapes });
          }
          break;

        case "NEW_SHAPE":
          if (activeCanvas) {
            void applyShapeToCanvas(activeCanvas, msg.shape);
          } else {
            pendingSyncRef.current.push({ type: "NEW_SHAPE", shape: msg.shape });
          }
          break;

        case "DELETE_SHAPE":
          if (activeCanvas) {
            deleteShapeFromCanvas(activeCanvas, msg.shapeId);
          } else {
            pendingSyncRef.current.push({
              type: "DELETE_SHAPE",
              shapeId: msg.shapeId,
            });
          }
          break;

        case "ERROR":
          toast.error(msg.message);
          break;
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws, setParticipants, setIsInRoom, setIsConnected]);

  useEffect(() => {
    if (!canvas) return;
    void flushPendingSync(canvas);
  }, [canvas]);
};
