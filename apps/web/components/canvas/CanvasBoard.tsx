"use client";

import React, { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useTheme } from "next-themes";
import { Eraser } from "lucide-react";
import ReactDOMServer from "react-dom/server";

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

  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [zoom, setZoom] = useState<number>(100);

  const [mode, setMode] = useState<
    "select" | "draw" | "eraser" | "freeDraw" | "grab" | null
  >("select");
  const [activeTool, setActiveTool] = useState<ShapeType>("select");
  const [drawingShape, setDrawingShape] = useState<ShapeType | null>(null);
  const [tempShape, setTempShape] = useState<fabric.Object | null>(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ShapeType>("select");

  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const { theme } = useTheme();

  const themeColors: Record<"light" | "dark", string> = {
    light: "#ffffff",
    dark: "#121212",
  };

  const getCanvasBg = () =>
    theme === "dark" ? themeColors.dark : themeColors.light;

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

  useGrabMode({ canvas, mode });
  useDrawShapes({
    canvas,
    mode,
    drawingShape,
    tempShape,
    setTempShape,
    startPoint,
  });

  const handleAddShapes = useHandleAddShapes({
    canvas,
    setMode,
    setDrawingShape,
    setActiveTool,
  });

  const handleShapeSelect = (tool: ShapeType) => {
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
      // Disable selectability for existing shapes
      canvas?.getObjects().forEach((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
      canvas?.renderAll();
    } else if (tool === "eraser") {
      setMode("eraser");
      setShowPropertiesPanel(false);

      if (canvas) {
        canvas.getObjects().forEach((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        const eraserSvg = ReactDOMServer.renderToStaticMarkup(
          <Eraser color="black" size={24} />
        );

        const eraserCursor = `url("data:image/svg+xml;utf8,${encodeURIComponent(
          eraserSvg
        )}") 12 12, auto`;

        canvas.defaultCursor = eraserCursor;
        canvas.hoverCursor = eraserCursor;
        canvas.renderAll();
      }
    } else if (tool === "grab") {
      setMode("grab");
      setShowPropertiesPanel(false);
      canvas?.getObjects().forEach((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
      canvas?.renderAll();
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

  return (
    <div className="relative w-full h-full">
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
