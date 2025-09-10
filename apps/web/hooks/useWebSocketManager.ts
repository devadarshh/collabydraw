"use client";

import { useEffect } from "react";
import * as fabric from "fabric";
import { toast } from "sonner";
import { useCanvasStore } from "@/hooks/canvas/useCanvasStore";
import { useWsStore } from "@/hooks/useWsStore";

// Add 'id' to fabric's Object interface for our custom property
declare module "fabric" {
  namespace fabric {
    interface Object {
      id?: string;
    }
  }
}

export const useWebSocketManager = () => {
  const { canvas } = useCanvasStore();
  const { ws, isConnected } = useWsStore();

  useEffect(() => {
    if (!canvas || !ws || !isConnected) return;

    const handleMessage = (event: MessageEvent) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        console.log("Non-JSON message from server:", event.data);
        return;
      }

      console.log("Message from server:", msg);

      switch (msg.type) {
        case "ROOM_JOINED":
          toast.success(msg.message);
          break;

        case "USER_LEFT":
          toast.info(`${msg.userName} left the room`);
          break;

        case "LOAD_SHAPES":
          // msg.shapes is an array of serialized shape data
          // To load, we construct a JSON structure that Fabric's loadFromJSON understands
          const canvasJSON = { version: fabric.version, objects: msg.shapes };
          canvas.loadFromJSON(canvasJSON, () => {
            canvas.renderAll();
            // Make all objects non-selectable by default after loading
            canvas.forEachObject((obj) => {
              obj.selectable = false;
              obj.evented = true;
            });
          });
          break;

        case "NEW_SHAPE":
          const shapeJSON = msg.shape;
          if (!shapeJSON || !shapeJSON.id) return;

          // Check if the shape already exists to prevent duplicates (echo)
          const existingObject = canvas
            .getObjects()

            .find(
              (obj) =>
                // @ts-ignore
                obj.id === shapeJSON.id
            );
          if (existingObject) {
            return; // It's an echo of a shape we just drew, so ignore it.
          }

          // Use fabric's utility to revive the object from its JSON representation
          // @ts-ignore
          fabric.util.enlivenObjects(
            [shapeJSON],
            // @ts-ignore
            (objects) => {
              if (objects.length > 0) {
                const newObject = objects[0];
                newObject.set({ selectable: false, evented: true });
                canvas.add(newObject);
                canvas.renderAll();
              }
            },
            // @ts-ignore
            "fabric"
          );
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
  }, [canvas, ws, isConnected]);
};
