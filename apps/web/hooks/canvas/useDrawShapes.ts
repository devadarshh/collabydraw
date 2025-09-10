"use client";

import { useEffect, Dispatch, SetStateAction } from "react";
import * as fabric from "fabric";
import { ShapeType } from "@/types/tools";
import { useCanvasProperties } from "./useCanvasProperties";
import { useWsStore } from "../useWsStore";

interface UseDrawShapesProps {
  canvas: fabric.Canvas | null;
  mode: "select" | "draw" | "eraser" | "freeDraw" | "grab" | null;
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
  const {
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
    fontFamily,
    fontSize,
    textAlign,
    strokeStyle,
    textColor,
  } = useCanvasProperties();
  const { ws, isConnected, roomId } = useWsStore();

  useEffect(() => {
    if (!canvas) return;

    // Enable free drawing
    canvas.isDrawingMode = mode === "freeDraw";
    if (canvas.freeDrawingBrush && mode === "freeDraw") {
      canvas.freeDrawingBrush.color = strokeColor;
      canvas.freeDrawingBrush.width = strokeWidth;
    }
  }, [canvas, mode, strokeColor, strokeWidth, opacity]);

  useEffect(() => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    if (active.type === "i-text") {
      const textObj = active as fabric.IText;
      textObj.set({
        fill: textColor,
        fontFamily,
        fontSize,
        textAlign,
        opacity: opacity / 100,
      });
    } else {
      active.set({
        stroke: strokeColor,
        fill: fillColor,
        strokeWidth,
        opacity: opacity / 100,
      });
    }

    active.setCoords();
    canvas.renderAll();
  }, [
    canvas,
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
    fontFamily,
    fontSize,
    textColor,
    textAlign,
  ]);

  useEffect(() => {
    if (!canvas) return;
    const selectable = mode === "select";
    canvas.getObjects().forEach((obj) => obj.set({ selectable }));
    canvas.renderAll();
  }, [canvas, mode]);

  // Drawing shapes
  useEffect(() => {
    if (!canvas) return;

    let arrowLine: fabric.Line | null = null;
    let arrowHead: fabric.Triangle | null = null;

    const handleMouseDown = (opt: fabric.TEvent<fabric.TPointerEvent>) => {
      if (!canvas) return;
      const pointer = canvas.getPointer(opt.e as MouseEvent);

      if (mode === "eraser") {
        const target = canvas.findTarget(opt.e as MouseEvent);
        if (target) canvas.remove(target);
        return;
      }

      if (mode !== "draw" || !drawingShape) return;
      startPoint.current = { x: pointer.x, y: pointer.y };

      let shape: fabric.Object | null = null;
      const dashArray =
        strokeStyle === "dashed"
          ? [10, 5]
          : strokeStyle === "dotted"
            ? [2, 4]
            : undefined;

      switch (drawingShape) {
        case "rectangle":
          shape = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth,
            opacity: opacity / 100,
            strokeDashArray: dashArray,
            selectable: false,
          });
          break;
        case "ellipse":
          shape = new fabric.Ellipse({
            left: pointer.x,
            top: pointer.y,
            rx: 0,
            ry: 0,
            strokeWidth,
            stroke: strokeColor,
            fill: fillColor,
            opacity: opacity / 100,
            selectable: false,
            originX: "center",
            originY: "center",
            strokeDashArray: dashArray,
            objectCaching: false,
          });
          break;
        case "line":
          shape = new fabric.Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            {
              stroke: strokeColor,
              strokeWidth,
              opacity: opacity / 100,
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
              stroke: strokeColor,
              strokeWidth,
              opacity: opacity / 100,
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
            fill: strokeColor,
            opacity: opacity / 100,
            selectable: false,
            evented: false,
          });
          canvas.add(arrowLine, arrowHead);
          break;
        case "text":
          const text = new fabric.IText("", {
            left: pointer.x,
            top: pointer.y,
            fontFamily,
            fontSize,
            fill: textColor,
            textAlign,
            opacity: opacity / 100,
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
          break;
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
              fill: fillColor,
              stroke: strokeColor,
              strokeWidth,
              opacity: opacity / 100,
              selectable: false,
              strokeDashArray: dashArray,
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
        tempShape.set({
          rx: Math.abs(pointer.x - x) / 2,
          ry: Math.abs(pointer.y - y) / 2,
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
        tempShape.set({
          width: Math.abs(pointer.x - x),
          height: Math.abs(pointer.y - y),
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
          evented: true,
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
        tempShape.set({ selectable: false, evented: true });
        tempShape.setCoords();
        canvas.renderAll();
        if (ws && isConnected && roomId) {
          const shapeData = {
            id: crypto.randomUUID(),
            type: drawingShape,
            x: tempShape.left,
            y: tempShape.top,
            width: tempShape.width ?? 0,
            height: tempShape.height ?? 0,
            color: tempShape.fill ?? tempShape.stroke,
            strokeWidth: tempShape.strokeWidth,
            points: (tempShape as any).points ?? undefined,
          };
          ws.send(
            JSON.stringify({ type: "CREATE_SHAPE", roomId, shape: shapeData })
          );
        }
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
