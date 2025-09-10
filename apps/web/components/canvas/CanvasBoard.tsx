"use client";

import React, { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";

import { useCanvasStore } from "@/hooks/canvas/useCanvasStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useWsStore } from "@/hooks/useWsStore";
import { applyFabricConfig } from "@/config/fabricConfig";
import { ShapeType } from "@/types/tools";

import { Toolbar } from "./ToolBar";
import { CanvasSidebar } from "./CanvasSideBar";

import { useDrawShapes } from "@/hooks/canvas/useDrawShapes";
import { useCanvasZoom } from "@/hooks/canvas/useCanvasZoom";
import { useCanvasTheme } from "@/hooks/canvas/UseCanvasTheme";
import { useShortcutKeys } from "@/hooks/canvas/useKeyboardShortcuts";
import { useHandleAddShapes } from "@/hooks/canvas/useHandleAddShapes";
import { useGrabMode } from "@/hooks/canvas/useGrabMode";
// Import the new centralized hook
import { useWebSocketManager } from "@/hooks/useWebSocketManager";

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { canvas, setCanvas } = useCanvasStore();
  const { user } = useAuthStore();
  const [zoom, setZoom] = useState(100);

  const [mode, setMode] = useState<
    "select" | "draw" | "eraser" | "freeDraw" | "grab" | null
  >("select");
  const [activeTool, setActiveTool] = useState<ShapeType>("select");
  const [drawingShape, setDrawingShape] = useState<ShapeType | null>("select");
  const [tempShape, setTempShape] = useState<fabric.Object | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ShapeType>("select");

  const { theme } = useTheme();
  const themeColors: Record<"light" | "dark", string> = {
    light: "#ffffff",
    dark: "#121212",
  };
  const getCanvasBg = () =>
    theme === "dark" ? themeColors.dark : themeColors.light;

  const handleAddShapes = useHandleAddShapes({
    canvas,
    setMode,
    setDrawingShape,
    setActiveTool,
  });

  const handleShapeSelect = (tool: ShapeType) => {
    // This function's logic remains the same
    setDrawingShape(tool);
    setActiveTool(tool);
    setSelectedTool(tool);

    if (
      [
        "rectangle",
        "circle",
        "ellipse",
        "line",
        "diamond",
        "arrow",
        "freeDraw",
        "text",
      ].includes(tool)
    ) {
      setMode("draw");
      setShowPropertiesPanel(true);
      canvas?.getObjects().forEach((obj) => {
        obj.selectable = false;
        obj.evented = true;
        obj.hoverCursor = "default";
      });
      canvas?.renderAll();
    } else if (tool === "eraser") {
      setMode("eraser");
      setShowPropertiesPanel(false);
    } else if (tool === "grab") {
      setMode("grab");
      setShowPropertiesPanel(false);
    } else if (tool === "select") {
      setMode("select");
      setShowPropertiesPanel(false);
      canvas?.getObjects().forEach((obj) => {
        obj.selectable = true;
        obj.evented = true;
      });
      canvas?.renderAll();
    }

    handleAddShapes(tool);
  };

  useShortcutKeys({ handleAddShapes: handleShapeSelect });
  useCanvasTheme({ canvas });

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const parent = canvasRef.current.parentElement!;
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: parent.clientWidth,
      height: parent.clientHeight,
      selection: true,
      backgroundColor: getCanvasBg(),
    });
    applyFabricConfig(initCanvas);
    setCanvas(initCanvas);

    // Local storage logic remains the same
    const saved = localStorage.getItem("fabric-canvas");
    if (saved) {
      initCanvas.loadFromJSON(saved, () => {
        setTimeout(() => initCanvas.renderAll(), 0);
      });
    }

    const saveCanvasToLocal = () =>
      localStorage.setItem(
        "fabric-canvas",
        JSON.stringify(initCanvas.toJSON())
      );
    initCanvas.on("object:added", saveCanvasToLocal);
    initCanvas.on("object:modified", saveCanvasToLocal);
    initCanvas.on("object:removed", saveCanvasToLocal);

    const handleResize = () => {
      initCanvas.setWidth(parent.clientWidth);
      initCanvas.setHeight(parent.clientHeight);
      initCanvas.renderAll();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      initCanvas.dispose();
    };
  }, []);

  // Enable hooks
  useGrabMode({ canvas, mode });
  useDrawShapes({
    canvas,
    mode,
    drawingShape,
    tempShape,
    setTempShape,
    startPoint,
  });
  useCanvasZoom(canvas, setZoom);

  // Real-time collaboration - USE THE NEW HOOK
  useWebSocketManager();

  return (
    <div className="relative w-full h-full">
      {/* ... JSX remains the same ... */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-auto max-w-lg flex justify-center px-2 sm:px-0">
        <Toolbar activeTool={activeTool} onToolChange={handleShapeSelect} />
      </div>

      <CanvasSidebar
        showPropertiesPanel={showPropertiesPanel}
        setShowPropertiesPanel={setShowPropertiesPanel}
        selectedTool={selectedTool}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        canvas={canvas}
        zoom={zoom}
        setZoom={setZoom}
      />

      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default CanvasBoard;
