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
}: UseHandleAddShapesProps): ((type: ShapeType) => void) => {
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
            obj.evented = true;
            obj.selectable = false;
          });
          canvas.defaultCursor = "not-allowed";
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
          if (canvas.upperCanvasEl)
            canvas.upperCanvasEl.style.cursor = "crosshair";
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
          canvas.selection = false;
          resetCanvasObjects();
          canvas.defaultCursor = "crosshair";
          canvas.hoverCursor = "crosshair";
          break;
      }
    },
    [canvas, setActiveTool, setDrawingShape, setMode]
  );

  return handleAddShapes;
};
