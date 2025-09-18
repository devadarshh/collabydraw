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
          });
          canvas.defaultCursor = "default";
          canvas.hoverCursor = "move";
          break;
        case "eraser": {
          if (!canvas) return;

          setMode("eraser");
          setDrawingShape("eraser");

          canvas.isDrawingMode = false;
          canvas.selection = false;

          function setEraserCursor(size: number) {
            if (!canvas) return;
            const radius = size / 2;
            const cursorCanvas = document.createElement("canvas");
            cursorCanvas.width = size * 2;
            cursorCanvas.height = size * 2;

            const ctx = cursorCanvas.getContext("2d")!;
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
              obj.selectable = false;
              obj.evented = true;
              obj.hoverCursor = cursorStyle;
            });
          }

          setEraserCursor(16);

          const eraseHandler = (opt: any) => {
            const target = opt.target;
            if (target) {
              canvas.remove(target);
              canvas.requestRenderAll();
            }
          };

          canvas.off("mouse:down");
          canvas.on("mouse:down", eraseHandler);

          break;
        }

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
        case "triangle":
          setMode("draw");
          setDrawingShape("triangle");
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
