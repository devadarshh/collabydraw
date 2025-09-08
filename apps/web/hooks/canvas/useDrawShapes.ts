"use client";

import { useEffect, RefObject, useRef, Dispatch, SetStateAction } from "react";
import * as fabric from "fabric";
import { ShapeType } from "@/types/tools";

interface UseDrawShapesProps {
  canvas: fabric.Canvas | null;
  mode: string | null;
  drawingShape: ShapeType | null;
  tempShape: fabric.Object | null;
  setTempShape: Dispatch<SetStateAction<fabric.Object | null>>;
  startPoint: React.MutableRefObject<{ x: number; y: number } | null>;
}

export function useDrawShapes({
  canvas,
  mode,
  drawingShape,
  tempShape,
  setTempShape,
  startPoint,
}: UseDrawShapesProps) {
  useEffect(() => {
    if (!canvas) return;

    let arrowLine: fabric.Line | null = null;
    let arrowHead: fabric.Triangle | null = null;

    const handleMouseDown = (opt: fabric.TEvent<fabric.TPointerEvent>) => {
      const pointer = canvas.getPointer(opt.e as MouseEvent);

      if (mode === "eraser") {
        const target = canvas.findTarget(opt.e as MouseEvent);
        if (target) canvas.remove(target);
        return;
      }

      if (mode !== "draw" || !drawingShape) return;

      startPoint.current = { x: pointer.x, y: pointer.y };

      let shape: fabric.Object | null = null;

      switch (drawingShape) {
        case "rectangle":
          shape = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: "rgba(0,0,0,0)",
            stroke: "blue",
            strokeWidth: 2,
            selectable: false,
          });
          break;
        case "ellipse":
          shape = new fabric.Ellipse({
            left: pointer.x,
            top: pointer.y,
            rx: 0,
            ry: 0,
            strokeWidth: 2,
            stroke: "blue",
            fill: "rgba(0,0,0,0)",
            selectable: true,
            objectCaching: false,
            originX: "center",
            originY: "center",
          });
          break;
        case "line":
          shape = new fabric.Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            {
              stroke: "blue",
              strokeWidth: 2,
              selectable: false,
              objectCaching: false,
              evented: false,
            }
          );
          break;
        case "arrow":
          arrowLine = new fabric.Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            {
              stroke: "blue",
              strokeWidth: 2,
              selectable: false,
              evented: false,
            }
          );
          arrowHead = new fabric.Triangle({
            left: pointer.x,
            top: pointer.y,
            originX: "center",
            originY: "center",
            width: 15,
            height: 20,
            fill: "blue",
            selectable: false,
            evented: false,
          });
          canvas.add(arrowLine, arrowHead);
          break;
        case "text":
          const text = new fabric.IText("", {
            left: pointer.x,
            top: pointer.y,
            fontFamily: "Arial",
            fontSize: 24,
            fill: "blue",
            editable: true,
            width: 150,
            height: 40,
            backgroundColor: "rgba(0,0,0,0.05)",
            padding: 5,
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
          text.hiddenTextarea?.focus();
          startPoint.current = null;
          setTempShape(null);
          return;
        case "diamond":
          shape = new fabric.Polygon(
            [
              { x: 0, y: 50 },
              { x: 50, y: 0 },
              { x: 100, y: 50 },
              { x: 50, y: 100 },
            ],
            {
              left: pointer.x,
              top: pointer.y,
              fill: "transparent",
              stroke: "blue",
              strokeWidth: 2,
              selectable: false,
              objectCaching: false,
            }
          );
          break;
        default:
          return;
      }

      if (shape) {
        canvas.add(shape);
        setTempShape(shape);
      }
    };

    const handleMouseMove = (opt: fabric.TEvent<fabric.TPointerEvent>) => {
      if (mode !== "draw" || !drawingShape || !startPoint.current) return;

      const pointer = canvas.getPointer(opt.e as MouseEvent);
      const { x, y } = startPoint.current;

      if (drawingShape === "rectangle" && tempShape instanceof fabric.Rect) {
        tempShape.set({
          width: Math.abs(pointer.x - x),
          height: Math.abs(pointer.y - y),
          left: Math.min(pointer.x, x),
          top: Math.min(pointer.y, y),
        });
      }
      if (drawingShape === "ellipse" && tempShape instanceof fabric.Ellipse) {
        const rx = Math.abs(pointer.x - x) / 2;
        const ry = Math.abs(pointer.y - y) / 2;
        tempShape.set({
          rx,
          ry,
          left: (pointer.x + x) / 2,
          top: (pointer.y + y) / 2,
        });
      }
      if (drawingShape === "line" && tempShape instanceof fabric.Line) {
        tempShape.set({ x2: pointer.x, y2: pointer.y });
      }
      if (drawingShape === "arrow" && arrowLine && arrowHead) {
        arrowLine.set({ x2: pointer.x, y2: pointer.y });
        arrowHead.set({
          left: pointer.x,
          top: pointer.y,
          angle:
            (Math.atan2(pointer.y - arrowLine.y1!, pointer.x - arrowLine.x1!) *
              180) /
              Math.PI +
            90,
        });
      }
      if (drawingShape === "diamond" && tempShape instanceof fabric.Polygon) {
        const width = Math.abs(pointer.x - x);
        const height = Math.abs(pointer.y - y);
        tempShape.set({
          width,
          height,
          left: Math.min(pointer.x, x),
          top: Math.min(pointer.y, y),
        });
      }

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (mode !== "draw") return;

      if (drawingShape === "arrow" && arrowLine && arrowHead) {
        const arrowGroup = new fabric.Group([arrowLine, arrowHead], {
          selectable: false,
          evented: false,
        }) as fabric.Group & { line: fabric.Line; head: fabric.Triangle };
        arrowGroup.line = arrowLine;
        arrowGroup.head = arrowHead;

        canvas.remove(arrowLine);
        canvas.remove(arrowHead);
        canvas.add(arrowGroup);

        arrowLine = null;
        arrowHead = null;
        startPoint.current = null;
      } else if (tempShape) {
        tempShape.set({ selectable: true, evented: true });
        tempShape.setCoords();
        canvas.renderAll();
        setTempShape(null);
        startPoint.current = null;
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvas, drawingShape, mode, tempShape, setTempShape, startPoint]);
}
