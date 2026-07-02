"use client";

import { useEffect } from "react";
import * as fabric from "fabric";
import { toast } from "sonner";
import type { ServerMessage } from "@repo/zod/ws-messages";
import { useCanvasStore } from "@/hooks/canvas/useCanvasStore";
import { useWsStore } from "@/hooks/websocket/useWsStore";

export const useWebSocketManager = () => {
  const { canvas } = useCanvasStore();
  const { ws, isConnected, setParticipants } = useWsStore();

  useEffect(() => {
    if (!canvas || !ws || !isConnected) return;

    const handleMessage = (event: MessageEvent) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(event.data) as ServerMessage;
      } catch {
        console.log("Non-JSON message from server:", event.data);
        return;
      }

      switch (msg.type) {
        case "ROOM_JOINED":
          setParticipants(msg.participants);
          canvas.clear();
          canvas.backgroundColor =
            document.documentElement.classList.contains("dark")
              ? "#121212"
              : "#ffffff";
          toast.success(msg.message);
          break;

        case "USER_JOINED":
          setParticipants(msg.participants);
          toast.info(`${msg.userName} joined the room`);
          break;

        case "USER_LEFT":
          setParticipants(msg.participants);
          toast.info(`${msg.userName} left the room`);
          break;

        case "LOAD_SHAPES": {
          const canvasJSON = { version: fabric.version, objects: msg.shapes };
          canvas.loadFromJSON(canvasJSON, () => {
            canvas.renderAll();
            canvas.forEachObject((obj) => {
              obj.selectable = false;
              obj.evented = true;
            });
          });
          break;
        }

        case "NEW_SHAPE": {
          const shapeJSON = msg.shape;
          if (!shapeJSON?.id) return;

          const existingObject = canvas
            .getObjects()
            .find((obj) => (obj as fabric.FabricObject & { id?: string }).id === shapeJSON.id);
          if (existingObject) {
            fabric.util.enlivenObjects([shapeJSON]).then((objects) => {
              if (objects.length > 0) {
                const updated = objects[0] as fabric.FabricObject;
                updated.set({ selectable: false, evented: true });
                canvas.remove(existingObject);
                canvas.add(updated);
                canvas.renderAll();
              }
            });
            return;
          }

          fabric.util.enlivenObjects([shapeJSON]).then((objects) => {
            if (objects.length > 0) {
              const newObject = objects[0] as fabric.FabricObject;
              newObject.set({ selectable: false, evented: true });
              canvas.add(newObject);
              canvas.renderAll();
            }
          });
          break;
        }

        case "DELETE_SHAPE": {
          const obj = canvas
            .getObjects()
            .find(
              (o) =>
                (o as fabric.FabricObject & { id?: string }).id === msg.shapeId
            );
          if (obj) {
            canvas.remove(obj);
            canvas.renderAll();
          }
          break;
        }

        case "ERROR":
          toast.error(msg.message);
          break;
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [canvas, ws, isConnected, setParticipants]);
};
