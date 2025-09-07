"use client";

import { useCallback } from "react";
import * as fabric from "fabric";
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

export const useHandleAddShapes = ({
  canvas,
  setMode,
  setDrawingShape,
  setActiveTool,
}: UseHandleAddShapesProps) => {
  const handleAddShapes = useCallback(
    (type: ShapeType) => {
      setActiveTool(type);

      if (!canvas) return;

      // Reset common canvas properties
      const resetCanvasObjects = () => {
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
      };

      if (type === "select") {
        setMode("select");
        setDrawingShape(null);

        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.forEachObject((obj) => {
          obj.selectable = true;
          obj.evented = true;
          obj.lockRotation = true;
        });
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
      } else if (type === "eraser") {
        setMode("eraser");
        setDrawingShape("eraser");

        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.forEachObject((obj) => {
          obj.evented = true;
          obj.selectable = false;
        });
      } else if (type === "grab") {
        setMode("grab");
        setDrawingShape(null);

        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        canvas.defaultCursor = "grab";
      } else if (type === "freeDraw") {
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
      } else if (type === "text") {
        setMode("draw");
        setDrawingShape("text");

        canvas.isDrawingMode = false;
        canvas.selection = false;
        resetCanvasObjects();
        canvas.defaultCursor = "text";
        canvas.hoverCursor = "text";
      } else {
        // Shapes like rectangle, ellipse, arrow, diamond
        setMode("draw");
        setDrawingShape(type);

        canvas.selection = false;
        resetCanvasObjects();
        canvas.defaultCursor = "crosshair";
        canvas.hoverCursor = "crosshair";
      }
    },
    [canvas, setActiveTool, setDrawingShape, setMode]
  );

  return handleAddShapes;
};
