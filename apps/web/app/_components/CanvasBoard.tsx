"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useTheme } from "next-themes";
import ToolBar from "./ToolBar";
import { ShapeType } from "../../types";
import { applyFabricConfig } from "@/config/fabricConfig";

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [mode, setMode] = useState<
    "select" | "draw" | "eraser" | "freeDraw" | null
  >(null);
  const [drawingShape, setDrawingShape] = useState<ShapeType | null>(null);
  const [tempShape, setTempShape] = useState<fabric.Object | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const { theme } = useTheme();

  const themeColors: Record<"light" | "dark", string> = {
    light: "#ffffff",
    dark: "#121212",
  };
  const getCanvasBg = (): string => {
    if (theme === "dark") return themeColors.dark;
    return themeColors.light;
  };
  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
        selection: true,
        backgroundColor: getCanvasBg(),
      });
      applyFabricConfig(initCanvas);

      setCanvas(initCanvas);

      const handleResize = () => {
        initCanvas.setWidth(window.innerWidth);
        initCanvas.setHeight(window.innerHeight);
        initCanvas.renderAll();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        initCanvas.dispose();
      };
    }
  }, []);

  useEffect(() => {
    const handleShortcutKeys = (e: KeyboardEvent) => {
      switch (e.key) {
        case "1":
          handleAddShapes("select");
          break;
        case "2":
          handleAddShapes("grab");
          break;
        case "3":
          handleAddShapes("rectangle");
          break;
        case "4":
          handleAddShapes("ellipse");
          break;
        case "5":
          handleAddShapes("diamond");
          break;
        case "6":
          handleAddShapes("line");
          break;
        case "7":
          handleAddShapes("freeDraw");
          break;
        case "8":
          handleAddShapes("arrow");
          break;
        case "9":
          handleAddShapes("text");
          break;
        case "0":
          handleAddShapes("eraser");
          break;
      }
    };

    window.addEventListener("keydown", handleShortcutKeys);
    return () => window.removeEventListener("keydown", handleShortcutKeys);
  }, [canvas]);

  useEffect(() => {
    if (!canvas) {
      return;
    }
    const handleMouseDown = (opt: fabric.TEvent<fabric.TPointerEvent>) => {
      if (!canvas) return;

      const pointer = canvas.getPointer(opt.e as MouseEvent);

      if (mode === "eraser") {
        const target = canvas.findTarget(opt.e as MouseEvent);
        if (target) {
          canvas.remove(target);
        }
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
            strokeWidth: 3,
            selectable: false,
          });
          break;
      }

      if (shape) {
        canvas.add(shape);
        setTempShape(shape);
      }
    };

    const handleMouseMove = (opt: fabric.TEvent<fabric.TPointerEvent>) => {
      if (mode !== "draw" || !drawingShape || !tempShape || !startPoint.current)
        return;

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

      tempShape.setCoords();
      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (mode !== "draw") return;
      if (tempShape) {
        tempShape.set({
          selectable: false,
          evented: false,
        });
        tempShape.setCoords();
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
  }, [canvas, drawingShape, tempShape, mode]);

  const handleAddShapes = (type: ShapeType) => {
    if (type === "select") {
      setMode("select");
      setDrawingShape(null);
      if (canvas) {
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.forEachObject((obj) => {
          obj.selectable = true;
          obj.evented = true;
          obj.lockRotation = true;
        });
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
      }
    } else if (type === "eraser") {
      setMode("eraser");
      setDrawingShape("eraser");
      if (canvas) {
        canvas.selection = false;
        canvas.forEachObject((obj) => {
          obj.evented = true;
          obj.selectable = false;
        });
      }
    } else if (type === "freeDraw") {
      setMode("draw");
      setDrawingShape("freeDraw");

      if (canvas) {
        canvas.selection = false;
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);

        canvas.freeDrawingBrush.width = 3;
        canvas.freeDrawingBrush.color = "blue";

        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });

        if (canvas.upperCanvasEl) {
          canvas.upperCanvasEl.style.cursor = "crosshair";
        }
      }
    } else {
      setMode("draw");
      setDrawingShape(type);
      if (canvas) {
        canvas.selection = false;
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        canvas.defaultCursor = "crosshair";
        canvas.hoverCursor = "crosshair";
      }
    }
  };

  useEffect(() => {
    if (canvas) {
      canvas.backgroundColor = getCanvasBg();
      canvas.renderAll();
    }
  }, [theme, canvas]);

  return (
    <div className="relative w-screen h-screen">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <ToolBar
          selectedShape={drawingShape ?? "select"}
          onAddShape={handleAddShapes}
        />
      </div>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default CanvasBoard;
