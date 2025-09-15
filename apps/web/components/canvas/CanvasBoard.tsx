"use client";

import React, { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useTheme } from "next-themes";
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

import { Toolbar } from "./ToolBar";
import { CanvasSidebar } from "./CanvasSideBar";

import { applyFabricConfig } from "@/config/fabricConfig";
import { ShapeType } from "@/types/tools";

const CanvasBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { canvas, setCanvas } = useCanvasStore();
  const { resolvedTheme } = useTheme();

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

  useEffect(() => {
    if (!canvasRef.current) return;

    const parent = canvasRef.current.parentElement!;
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: parent.clientWidth,
      height: parent.clientHeight,
      selection: true,
      backgroundColor: resolvedTheme === "dark" ? "#121212" : "#ffffff",
    });

    applyFabricConfig(initCanvas);
    setCanvas(initCanvas);

    const savedCanvas = localStorage.getItem("fabric-canvas");
    if (savedCanvas) {
      initCanvas.loadFromJSON(savedCanvas, () => {
        setTimeout(() => initCanvas.renderAll(), 0);
      });
    }

    const saveCanvasToLocal = throttle(() => {
      localStorage.setItem(
        "fabric-canvas",
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
  }, [resolvedTheme, setCanvas]);

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
      "diamond",
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

  // Hooks for canvas behavior
  useShortcutKeys({ handleAddShapes: handleShapeSelect });
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

export default CanvasBoard;
