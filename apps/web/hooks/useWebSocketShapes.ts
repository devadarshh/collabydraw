"use client";
import { useEffect } from "react";
import * as fabric from "fabric";
import { useCanvasStore } from "@/hooks/canvas/useCanvasStore";
import { useWsStore } from "@/hooks/useWsStore";
import { ShapeType } from "@/types/tools";
type ShapeData = {
  id: string;
  type:
    | "rectangle"
    | "ellipse"
    | "line"
    | "arrow"
    | "diamond"
    | "text"
    | "freeDraw";
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  points?: { x: number; y: number }[];
  text?: string;
};

export const useWebSocketShapes = (roomId: string, token: string) => {
  const { canvas } = useCanvasStore();
  const { ws, isConnected } = useWsStore();
  const addShapeToCanvas = (shape: ShapeData) => {
    let obj: fabric.Object | null = null;

    switch (shape.type) {
      case "rectangle":
        obj = new fabric.Rect({
          id: shape.id,
          left: shape.x,
          top: shape.y,
          width: shape.width,
          height: shape.height,
          fill: shape.color,
          stroke: shape.color,
          strokeWidth: shape.strokeWidth,
          selectable: false,
        });
        break;
      case "ellipse":
        obj = new fabric.Ellipse({
          id: shape.id,
          left: shape.x,
          top: shape.y,
          rx: (shape.width || 0) / 2,
          ry: (shape.height || 0) / 2,
          fill: shape.color,
          stroke: shape.color,
          strokeWidth: shape.strokeWidth,
          selectable: false,
        });
        break;
      case "line":
        obj = new fabric.Line(
          // @ts-ignore
          [shape.x, shape.y, shape.points![0].x, shape.points![0].y],
          {
            id: shape.id,
            stroke: shape.color,
            strokeWidth: shape.strokeWidth,
            selectable: false,
          }
        );
        break;
      // Add more shape types here
    }
    // @ts-ignore
    if (obj) canvas.add(obj);
  };

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

      // Load existing shapes immediately
      if (msg.type === "LOAD_SHAPES") {
        msg.shapes.forEach((shape: ShapeData) => {
          addShapeToCanvas(shape);
        });
        canvas.renderAll();
      }

      // New shape from other user
      if (msg.type === "NEW_SHAPE") {
        addShapeToCanvas(msg.shape);
        canvas.renderAll();
      }

      // Deleted shape
      if (msg.type === "DELETE_SHAPE") {
        const obj = canvas.getObjects().find((o: any) => o.id === msg.shapeId);
        if (obj) {
          canvas.remove(obj);
          canvas.renderAll();
        }
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [canvas, ws, isConnected]);
};
