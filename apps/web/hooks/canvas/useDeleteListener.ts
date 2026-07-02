import { useEffect } from "react";
import * as fabric from "fabric";
import { useWsStore } from "../websocket/useWsStore";
import {
  removeObjectFromCanvas,
  type CustomFabricObject,
} from "../websocket/wsMessages";

export function useDeleteListener(
  canvas: fabric.Canvas | null,
  selectedTool: string
): void {
  const { ws, roomId, isInRoom } = useWsStore();

  useEffect(() => {
    if (!canvas) return;
    if (selectedTool === "text") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObjects = canvas.getActiveObjects() as CustomFabricObject[];
        if (activeObjects.length > 0) {
          activeObjects.forEach((object) => {
            removeObjectFromCanvas(canvas, object, { ws, roomId, isInRoom });
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canvas, selectedTool, ws, roomId, isInRoom]);
}
