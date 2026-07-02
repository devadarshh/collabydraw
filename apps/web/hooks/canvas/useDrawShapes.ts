"use client";

import { useEffect, useCallback, Dispatch, SetStateAction } from "react";
import * as fabric from "fabric";
import { ShapeType } from "@/types/tools";
import { useCanvasProperties } from "./useCanvasProperties";
import { useWsStore } from "../websocket/useWsStore";
import {
  sendCreateShape,
  removeObjectFromCanvas,
  type CustomFabricObject,
} from "../websocket/wsMessages";
import { findEraserTarget } from "./canvasHitTest";

interface UseDrawShapesProps {
  canvas: fabric.Canvas | null;
  mode: "select" | "draw" | "eraser" | "freeDraw" | "grab" | null;
  drawingShape: ShapeType | null;
  tempShape: CustomFabricObject | null;
  setTempShape: Dispatch<SetStateAction<CustomFabricObject | null>>;
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

  const sendShapeToServer = useCallback(
    (shapeObject: CustomFabricObject) => {
      if (ws && isConnected && roomId && shapeObject) {
        sendCreateShape(ws, roomId, shapeObject);
      }
    },
    [ws, isConnected, roomId]
  );

  const removeShape = useCallback(
    (target: CustomFabricObject) => {
      if (!canvas) return;
      removeObjectFromCanvas(canvas, target, { ws, roomId, isConnected });
    },
    [canvas, ws, roomId, isConnected]
  );

  useEffect(() => {
    if (!canvas) return;
    canvas.isDrawingMode = mode === "freeDraw";
    if (canvas.freeDrawingBrush && mode === "freeDraw") {
      canvas.freeDrawingBrush.color = strokeColor;
      canvas.freeDrawingBrush.width = strokeWidth;
    }
  }, [canvas, mode, strokeColor, strokeWidth]);

  useEffect(() => {
    if (!canvas || !isConnected || !roomId) return;
    const active = canvas.getActiveObject() as CustomFabricObject | undefined;
    if (!active?.id) return;

    if (active.type === "i-text" || active.type === "textbox") {
      const textObj = active as fabric.IText;
      textObj.set({
        fill: fillColor,
        stroke: fillColor,
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
    sendShapeToServer(active);
  }, [
    canvas,
    isConnected,
    roomId,
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
    fontFamily,
    fontSize,
    textAlign,
    strokeStyle,
    textColor,
    sendShapeToServer,
  ]);

  useEffect(() => {
    if (!canvas) return;

    let arrowLine: fabric.Line | null = null;
    let arrowHead: fabric.Triangle | null = null;

    const handleMouseDown = (opt: fabric.TEvent<fabric.TPointerEvent>) => {
      if (!canvas) return;
      const pointer = canvas.getPointer(opt.e);

      if (mode === "eraser") {
        const target = findEraserTarget(canvas, opt.e);
        if (target) removeShape(target);
        return;
      }

      if (mode !== "draw" || !drawingShape) return;
      startPoint.current = { x: pointer.x, y: pointer.y };

      const dashArray =
        strokeStyle === "dashed"
          ? [10, 5]
          : strokeStyle === "dotted"
            ? [2, 4]
            : undefined;

      const commonProps = {
        id: crypto.randomUUID(),
        left: pointer.x,
        top: pointer.y,
        stroke: strokeColor,
        strokeWidth,
        fill: fillColor,
        opacity: opacity / 100,
        selectable: false,
        evented: true,
        strokeDashArray: dashArray,
        objectCaching: false,
      };

      let shape: CustomFabricObject | null = null;

      switch (drawingShape) {
        case "rectangle":
          shape = new fabric.Rect({ ...commonProps, width: 0, height: 0 });
          break;
        case "ellipse":
          shape = new fabric.Ellipse({
            ...commonProps,
            rx: 0,
            ry: 0,
            originX: "center",
            originY: "center",
          });
          break;
        case "line":
          shape = new fabric.Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            { ...commonProps, fill: undefined }
          );
          break;
        case "arrow":
          arrowLine = new fabric.Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            {
              stroke: strokeColor,
              strokeWidth,
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
            selectable: false,
            evented: false,
          });
          canvas.add(arrowLine, arrowHead);
          break;
        case "text": {
          const text = new fabric.Textbox("", {
            id: crypto.randomUUID(),
            left: pointer.x,
            top: pointer.y,
            fontSize,
            fill: fillColor,
            stroke: fillColor,
            strokeWidth: 1,
            textAlign,
            opacity: opacity / 100,
            editable: true,
            fontFamily,
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
          startPoint.current = null;
          setTempShape(null);
          break;
        }
        case "triangle":
          shape = new fabric.Polygon(
            [
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
            ],
            commonProps
          );
          break;
      }

      if (shape) {
        canvas.add(shape);
        setTempShape(shape);
      }
    };

    const handleMouseMove = (opt: fabric.TEvent<fabric.TPointerEvent>) => {
      if (
        !canvas ||
        mode !== "draw" ||
        !drawingShape ||
        !startPoint.current ||
        (!tempShape && !arrowLine)
      )
        return;

      const pointer = canvas.getPointer(opt.e);
      const { x, y } = startPoint.current;

      if (drawingShape === "rectangle" && tempShape instanceof fabric.Rect) {
        tempShape.set({
          width: Math.abs(pointer.x - x),
          height: Math.abs(pointer.y - y),
          left: Math.min(pointer.x, x),
          top: Math.min(pointer.y, y),
        });
      } else if (
        drawingShape === "ellipse" &&
        tempShape instanceof fabric.Ellipse
      ) {
        tempShape.set({
          rx: Math.abs(pointer.x - x) / 2,
          ry: Math.abs(pointer.y - y) / 2,
          left: (pointer.x + x) / 2,
          top: (pointer.y + y) / 2,
        });
      } else if (drawingShape === "line" && tempShape instanceof fabric.Line) {
        tempShape.set({ x2: pointer.x, y2: pointer.y });
      } else if (drawingShape === "arrow" && arrowLine && arrowHead) {
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
      } else if (
        drawingShape === "triangle" &&
        tempShape instanceof fabric.Polygon
      ) {
        const width = pointer.x - x;
        const height = pointer.y - y;
        const left = width >= 0 ? x : pointer.x;
        const top = height >= 0 ? y : pointer.y;
        tempShape.set({
          points: [
            { x: width / 2, y: 0 },
            { x: 0, y: height },
            { x: width, y: height },
          ],
          left,
          top,
        });
        tempShape.setCoords();
      }

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!canvas || mode !== "draw") return;

      if (drawingShape === "arrow" && arrowLine && arrowHead) {
        const arrowGroup = new fabric.Group([arrowLine, arrowHead], {
          selectable: false,
          evented: true,
        }) as CustomFabricObject;
        arrowGroup.id = crypto.randomUUID();
        canvas.remove(arrowLine, arrowHead);
        canvas.add(arrowGroup);
        sendShapeToServer(arrowGroup);
        arrowLine = null;
        arrowHead = null;
      } else if (tempShape) {
        tempShape.set({ selectable: false, evented: true });
        tempShape.setCoords();
        sendShapeToServer(tempShape);
      }

      setTempShape(null);
      startPoint.current = null;
      canvas.renderAll();
    };

    const handlePathCreated = (e: fabric.TEvent & { path?: fabric.Path }) => {
      if (e.path) {
        e.path.set({ opacity: opacity / 100, id: crypto.randomUUID() });
        sendShapeToServer(e.path as CustomFabricObject);
      }
    };

    const handleTextEditingExited = (e: fabric.TEvent & { target?: fabric.IText }) => {
      const target = e.target as CustomFabricObject | undefined;
      if (target) {
        sendShapeToServer(target);
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("path:created", handlePathCreated as never);
    canvas.on("text:editing:exited", handleTextEditingExited as never);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("path:created", handlePathCreated as never);
      canvas.off("text:editing:exited", handleTextEditingExited as never);
    };
  }, [
    canvas,
    drawingShape,
    mode,
    tempShape,
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
    fontFamily,
    fontSize,
    textAlign,
    strokeStyle,
    sendShapeToServer,
    removeShape,
    startPoint,
    setTempShape,
  ]);
}
