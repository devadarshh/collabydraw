"use client";
import React, { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useTheme } from "next-themes";
import { applyFabricConfig } from "@/config/fabricConfig";
import { ShapeType } from "@/types/tools";
import { useShortcutKeys } from "@/hooks/canvas/useKeyboardShortcuts";
import { useCanvasTheme } from "@/hooks/canvas/UseCanvasTheme";
import { useDrawShapes } from "@/hooks/canvas/useDrawShapes";
import { useHandleAddShapes } from "@/hooks/canvas/useHandleAddShapes";
import { useGrabMode } from "@/hooks/canvas/useGrabMode";
import { Toolbar } from "./ToolBar";
import { CanvasSidebar } from "./CanvasSideBar";

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas & Zoom
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [zoom, setZoom] = useState<number>(100);

  // Mode (for grab/draw/erase/select)
  const [mode, setMode] = useState<
    "select" | "draw" | "eraser" | "freeDraw" | "grab" | null
  >("select");

  // Active tool / selected shape
  const [activeTool, setActiveTool] = useState<ShapeType>("select");
  const [drawingShape, setDrawingShape] = useState<ShapeType | null>(null);

  // Sidebar / properties panel
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("");

  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const { theme } = useTheme();

  const themeColors: Record<"light" | "dark", string> = {
    light: "#ffffff",
    dark: "#121212",
  };
  const getCanvasBg = () =>
    theme === "dark" ? themeColors.dark : themeColors.light;

  // Initialize Fabric Canvas
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
  }, [theme]);

  // Hooks
  useGrabMode({ canvas, mode }); // only pass mode (type-safe)
  useDrawShapes({
    canvas,
    mode,
    drawingShape,
    tempShape: null,
    setTempShape: () => {},
    startPoint,
  });

  const handleAddShapes = useHandleAddShapes({
    canvas,
    setMode,
    setDrawingShape,
    setActiveTool,
  });

  // Wrap handleAddShapes to handle properties panel
  const handleShapeSelect = (tool: ShapeType) => {
    setDrawingShape(tool);
    setActiveTool(tool);

    // If the tool is a shape, open properties panel
    if (
      [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "rectangle",
        "circle",
        "line",
      ].includes(tool)
    ) {
      setSelectedTool(tool);
      setShowPropertiesPanel(true);
      setMode("draw"); // valid mode for drawing
    } else {
      setShowPropertiesPanel(false);
      setMode("select");
    }

    // Call existing handler
    handleAddShapes(tool);
  };

  useShortcutKeys({ handleAddShapes: handleShapeSelect });
  useCanvasTheme({ canvas });

  return (
    <div className="relative w-full h-full">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-auto max-w-lg flex justify-center px-2 sm:px-0">
        <Toolbar activeTool={activeTool} onToolChange={handleShapeSelect} />
      </div>

      {/* Sidebar / Properties Panel */}
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

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default CanvasBoard;
