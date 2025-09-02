"use client";
import { useState, useEffect, useRef } from "react";
import { ShapeType } from "../../types";
import ToolBar from "./ToolBar";
import * as fabric from "fabric";

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [mode, setMode] = useState<"select" | "draw" | null>(null);
  const [drawingShape, setDrawingShape] = useState<ShapeType | null>(null);
  const [tempShape, setTempShape] = useState<fabric.Object | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
        selection: true,
      });
      initCanvas.backgroundColor = "#ffffff";
      initCanvas.renderAll();
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
    if (!canvas) return;

    const handleMouseDown = (opt: fabric.TEvent<fabric.TPointerEvent>) => {
      if (mode !== "draw" || !drawingShape) return;

      const pointer = canvas.getPointer(opt.e as MouseEvent);
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
            selectionBackgroundColor: "",
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

      tempShape.setCoords();
      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (mode !== "draw") return;
      if (tempShape) {
        tempShape.set({ selectable: false });
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

  return (
    <div className="relative w-screen h-screen">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <ToolBar
          selectedShape={drawingShape ?? "select"}
          onAddShape={handleAddShapes}
        />
      </div>

      <canvas id="canvas" ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default CanvasBoard;
