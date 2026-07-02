"use client";

import { useCallback } from "react";
import * as fabric from "fabric";
import { useTheme } from "next-themes";
import { ShapeType } from "@/types/tools";

interface UseHandleAddShapesProps {
  canvas: fabric.Canvas | null;
  setMode: React.Dispatch<
    React.SetStateAction<
      "select" | "draw" | "eraser" | "freeDraw" | "grab" | null
    >
  >;
  setDrawingShape: React.Dispatch<React.SetStateAction<ShapeType | null>>;
  setActiveTool: React.Dispatch<React.SetStateAction<ShapeType>>;
}

function setEraserCursor(
  canvas: fabric.Canvas,
  theme: string | undefined,
  size: number
) {
  try {
    const radius = size / 2;
    const cursorCanvas = document.createElement("canvas");
    cursorCanvas.width = size * 2;
    cursorCanvas.height = size * 2;

    const ctx = cursorCanvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2d context");

    ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 1, 0, Math.PI * 2);

    const strokeColor = theme === "dark" ? "white" : "black";
    const shadowColor = theme === "dark" ? "black" : "white";

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 4;
    ctx.stroke();

    const cursorUrl = cursorCanvas.toDataURL("image/png");
    const cursorStyle = `url(${cursorUrl}) ${radius} ${radius}, auto`;

    canvas.defaultCursor = cursorStyle;
    canvas.hoverCursor = cursorStyle;
    canvas.forEachObject((obj) => {
      obj.hoverCursor = cursorStyle;
    });
  } catch {
    canvas.defaultCursor = "crosshair";
    canvas.hoverCursor = "crosshair";
  }
}

export const useHandleAddShapes = ({
  canvas,
  setMode,
  setDrawingShape,
  setActiveTool,
}: UseHandleAddShapesProps): ((type: ShapeType) => void) => {
  const { theme } = useTheme();

  const handleAddShapes = useCallback(
    (type: ShapeType) => {
      setActiveTool(type);
      if (!canvas) return;

      const resetCanvasObjects = (): void => {
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
      };

      switch (type) {
        case "select":
          setMode("select");
          setDrawingShape(null);
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.forEachObject((obj) => {
            obj.selectable = true;
            obj.evented = true;
            obj.lockRotation = false;
            obj.hoverCursor = "move";
          });
          canvas.defaultCursor = "default";
          canvas.hoverCursor = "move";
          break;

        case "eraser":
          setMode("eraser");
          setDrawingShape("eraser");
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.forEachObject((obj) => {
            obj.selectable = false;
            obj.evented = true;
          });
          setEraserCursor(canvas, theme, 16);
          break;

        case "grab":
          setMode("grab");
          setDrawingShape(null);
          canvas.isDrawingMode = false;
          canvas.selection = false;
          resetCanvasObjects();
          canvas.defaultCursor = "grab";
          canvas.hoverCursor = "grab";
          break;

        case "freeDraw":
          setMode("freeDraw");
          setDrawingShape("freeDraw");
          canvas.isDrawingMode = true;
          canvas.selection = false;
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
          canvas.freeDrawingBrush.width = 3;
          canvas.freeDrawingBrush.color = "blue";
          resetCanvasObjects();
          if (canvas.upperCanvasEl) {
            canvas.upperCanvasEl.style.cursor = "crosshair";
          }
          break;

        case "triangle":
          setMode("draw");
          setDrawingShape("triangle");
          canvas.isDrawingMode = false;
          canvas.selection = false;
          resetCanvasObjects();
          canvas.defaultCursor = "crosshair";
          canvas.hoverCursor = "crosshair";
          break;

        case "text":
          setMode("draw");
          setDrawingShape("text");
          canvas.isDrawingMode = false;
          canvas.selection = false;
          resetCanvasObjects();
          canvas.defaultCursor = "text";
          canvas.hoverCursor = "text";
          break;

        default:
          setMode("draw");
          setDrawingShape(type);
          canvas.isDrawingMode = false;
          canvas.selection = false;
          resetCanvasObjects();
          canvas.defaultCursor = "crosshair";
          canvas.hoverCursor = "crosshair";
          break;
      }
    },
    [canvas, setActiveTool, setDrawingShape, theme, setMode]
  );

  return handleAddShapes;
};
