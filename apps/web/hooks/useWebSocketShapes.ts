"use client";
import { useEffect } from "react";
import * as fabric from "fabric";
import { useCanvasStore } from "@/hooks/canvas/useCanvasStore";
import { useWsStore } from "@/hooks/useWsStore";
import { ShapeType } from "@/types/tools";

export const useWebSocketShapes = (roomId: string, token: string) => {
  const { canvas } = useCanvasStore();
  const { ws, isConnected } = useWsStore();

  // Listen for incoming shapes
  useEffect(() => {
    if (!canvas || !ws || !isConnected) return;

    const handleMessage = (event: MessageEvent) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        console.log("Non-JSON message:", event.data);
        return;
      }

      if (msg.type === "NEW_SHAPE") {
        const shape = msg.shape;

        switch (shape.type) {
          case "rectangle":
            const rect = new fabric.Rect({
              left: shape.x,
              top: shape.y,
              width: shape.width,
              height: shape.height,
              fill: shape.color,
              stroke: shape.color,
              strokeWidth: shape.strokeWidth,
              selectable: false,
            });
            canvas.add(rect);
            break;

          case "ellipse":
            const ellipse = new fabric.Ellipse({
              left: shape.x,
              top: shape.y,
              rx: shape.width! / 2,
              ry: shape.height! / 2,
              fill: shape.color,
              stroke: shape.color,
              strokeWidth: shape.strokeWidth,
              selectable: false,
            });
            canvas.add(ellipse);
            break;

          case "line":
            const line = new fabric.Line(
              [shape.x, shape.y, shape.points![0].x, shape.points![0].y],
              {
                stroke: shape.color,
                strokeWidth: shape.strokeWidth,
                selectable: false,
              }
            );
            canvas.add(line);
            break;

          // Add more shape types as needed
        }

        canvas.renderAll();
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [canvas, ws, isConnected]);
};
