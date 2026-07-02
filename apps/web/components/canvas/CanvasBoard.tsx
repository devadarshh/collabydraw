"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import * as fabric from "fabric";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import throttle from "lodash/throttle";
import { debounce } from "lodash";

import { useCanvasStore } from "@/hooks/canvas/useCanvasStore";
import { useDrawShapes } from "@/hooks/canvas/useDrawShapes";
import { useCanvasZoom } from "@/hooks/canvas/useCanvasZoom";
import { useCanvasTheme } from "@/hooks/canvas/UseCanvasTheme";
import { useShortcutKeys } from "@/hooks/canvas/useKeyboardShortcuts";
import { useHandleAddShapes } from "@/hooks/canvas/useHandleAddShapes";
import { useGrabMode } from "@/hooks/canvas/useGrabMode";
import { useWebSocketManager } from "@/hooks/websocket/useWebSocketManager";
import { useWsStore } from "@/hooks/websocket/useWsStore";

import { Toolbar } from "./ToolBar";
import { CanvasSidebar } from "./CanvasSideBar";

import { applyFabricConfig, loadExcalifont } from "@/config/fabricConfig";
import { ShapeType } from "@/types/tools";
import { useDeleteListener } from "@/hooks/canvas/useDeleteListener";

const LOCAL_CANVAS_KEY = "fabric-canvas-local";

function CanvasBoardContent() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { canvas, setCanvas, setBackgroundColor } = useCanvasStore();
  const { resolvedTheme } = useTheme();
  const { isInRoom } = useWsStore();
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get("room");

  const [zoom, setZoom] = useState(100);
  const [mode, setMode] = useState<
    "select" | "draw" | "eraser" | "freeDraw" | "grab" | null
  >("select");
  const [activeTool, setActiveTool] = useState<ShapeType>("select");
  const [drawingShape, setDrawingShape] = useState<ShapeType | null>("select");
  const [tempShape, setTempShape] = useState<fabric.FabricObject | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ShapeType>("select");

  const shouldUseLocalStorage = !isInRoom && !roomFromUrl;

  useEffect(() => {
    if (!canvasRef.current) return;

    const parent = canvasRef.current.parentElement!;
    const storedBg = useCanvasStore.getState().backgroundColor;
    const defaultBg = resolvedTheme === "dark" ? "#121212" : "#ffffff";
    const initialBg = storedBg !== "#ffffff" ? storedBg : defaultBg;

    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: parent.clientWidth,
      height: parent.clientHeight,
      selection: true,
      backgroundColor: initialBg,
    });

    applyFabricConfig(initCanvas);
    setCanvas(initCanvas);
    setBackgroundColor(initialBg);

    void loadExcalifont().then(() => {
      initCanvas.requestRenderAll();
    });

    if (shouldUseLocalStorage) {
      const savedCanvas = localStorage.getItem(LOCAL_CANVAS_KEY);
      if (savedCanvas) {
        initCanvas.loadFromJSON(savedCanvas, () => {
          const bg =
            typeof initCanvas.backgroundColor === "string"
              ? initCanvas.backgroundColor
              : initialBg;
          setBackgroundColor(bg);
          setTimeout(() => initCanvas.renderAll(), 0);
        });
      }
    }

    const saveCanvasToLocal = throttle(() => {
      if (!shouldUseLocalStorage) return;
      localStorage.setItem(
        LOCAL_CANVAS_KEY,
        JSON.stringify(initCanvas.toJSON())
      );
    }, 500);

    initCanvas.on("object:added", saveCanvasToLocal);
    initCanvas.on("object:modified", saveCanvasToLocal);
    initCanvas.on("object:removed", saveCanvasToLocal);

    const handleResize = debounce(() => {
      initCanvas.setWidth(parent.clientWidth);
      initCanvas.setHeight(parent.clientHeight);
      initCanvas.renderAll();
    }, 200);

    window.addEventListener("resize", handleResize);

    return () => {
      initCanvas.off("object:added", saveCanvasToLocal);
      initCanvas.off("object:modified", saveCanvasToLocal);
      initCanvas.off("object:removed", saveCanvasToLocal);
      window.removeEventListener("resize", handleResize);
      saveCanvasToLocal.cancel();
      handleResize.cancel();
      initCanvas.dispose();
    };
  }, [resolvedTheme, setCanvas, setBackgroundColor, shouldUseLocalStorage]);

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

    const drawableTools: ShapeType[] = [
      "rectangle",
      "ellipse",
      "line",
      "triangle",
      "arrow",
      "freeDraw",
      "text",
    ];

    if (drawableTools.includes(tool)) {
      setMode("draw");
      setShowPropertiesPanel(true);
      canvas?.getObjects().forEach((obj) => {
        obj.selectable = false;
        obj.evented = true;
        obj.hoverCursor = "default";
      });
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
    }

    canvas?.renderAll();
    handleAddShapes(tool);
  };

  useShortcutKeys({
    handleAddShapes: handleShapeSelect,
    activeTool,
    canvas,
  });
  useCanvasTheme({ canvas });
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

  useDeleteListener(canvas, selectedTool);

  useWebSocketManager();

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-auto max-w-lg flex justify-center px-2 sm:px-0 cursor-pointer">
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

export default function CanvasBoard() {
  return (
    <Suspense fallback={null}>
      <CanvasBoardContent />
    </Suspense>
  );
}
