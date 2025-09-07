"use client";
import React, { ReactNode } from "react";
import { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useTheme } from "next-themes";
import { applyFabricConfig } from "@/config/fabricConfig";
import { zoomIn, zoomOut, resetZoom } from "@/utils/zoomUtils";
import { ShapeType } from "@/types/tools";
import { AppSidebar } from "../_components/AppSidebar";
import { Toolbar } from "./ToolBar";
import { Settings, X } from "lucide-react";
import { InfoSidebar } from "./InfoSidebar";
import { ZoomControl } from "@/components/ZoomControl";
import { ResponsiveSidebar } from "@/components/ResponsiveSideBar";

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<ShapeType>("select");
  const [isActive, setIsActive] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // toggle sidebar

  const [mode, setMode] = useState<
    "select" | "draw" | "eraser" | "freeDraw" | "grab" | null
  >(null);
  const [drawingShape, setDrawingShape] = useState<ShapeType | null>(null);
  const [tempShape, setTempShape] = useState<fabric.Object | null>(null);
  const [zoom, setZoom] = useState<number>(100);

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

  // init canvas
  useEffect(() => {
    if (canvasRef.current) {
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
    }
  }, []);
  const handleToolChange = (toolId: string) => {
    setActiveTool(toolId as any);

    if (!canvas) return;

    if (toolId === "select") {
      canvas.isDrawingMode = false;
      canvas.selection = true;
    } else if (toolId === "eraser") {
      // TODO: add eraser logic
    } else if (toolId === "pen") {
      canvas.isDrawingMode = true;
    } else {
      // TODO: draw shapes based on toolId
    }
  };

  // grab/pan
  useEffect(() => {
    if (!canvas) return;
    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleMouseDown = (opt: fabric.TEvent<fabric.TPointerEvent>) => {
      if (mode === "grab") {
        isDragging = true;
        const evt = opt.e as MouseEvent;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        canvas.selection = false;
        canvas.defaultCursor = "grabbing";
      }
    };
    const handleMouseMove = (opt: fabric.TEvent<fabric.TPointerEvent>) => {
      if (isDragging && mode === "grab") {
        const e = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform!;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        canvas.requestRenderAll();
        lastPosX = e.clientX;
        lastPosY = e.clientY;
      }
    };
    const handleMouseUp = () => {
      if (mode === "grab") {
        isDragging = false;
        canvas.defaultCursor = "grab";
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
  }, [canvas, mode]);

  // zoom with ctrl+wheel
  useEffect(() => {
    if (!canvas) return;
    const wheelHandler = (opt: fabric.TEvent<WheelEvent>) => {
      const evt = opt.e as WheelEvent;
      if (!evt.ctrlKey && !evt.metaKey) return;

      const delta = evt.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 1 - delta / 1000;
      if (zoom > 5) zoom = 5;
      if (zoom < 0.5) zoom = 0.5;

      const point = new fabric.Point(evt.offsetX, evt.offsetY);
      canvas.zoomToPoint(point, zoom);

      evt.preventDefault();
      evt.stopPropagation();
      setZoom(Math.round(canvas.getZoom() * 100));
    };

    canvas.on("mouse:wheel", wheelHandler);
    return () => canvas.off("mouse:wheel", wheelHandler);
  }, [canvas]);

  // keyboard shortcuts
  useEffect(() => {
    const handleShortcutKeys = (e: KeyboardEvent) => {
      const shortcutMap: Record<string, ShapeType> = {
        "1": "select",
        "2": "rectangle",
        "3": "ellipse",
        "4": "diamond",
        "5": "line",
        "6": "freeDraw",
        "7": "arrow",
        "8": "text",
        "9": "eraser",
        "0": "grab",
      };

      const tool = shortcutMap[e.key];
      if (tool) handleAddShapes(tool);
    };

    window.addEventListener("keydown", handleShortcutKeys);
    return () => window.removeEventListener("keydown", handleShortcutKeys);
  }, [canvas]);

  // drawing logic
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
          });
          break;
        case "line":
          shape = new fabric.Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            {
              stroke: "blue",
              strokeWidth: 3,
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
              strokeWidth: 3,
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
              width: 0,
              height: 0,
              fill: "transparent", // Correct fill
              stroke: "blue",
              strokeWidth: 3,
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
          width: width,
          height: height,
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
        tempShape.set({
          selectable: true,
          evented: true,
        });

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
  }, [canvas, drawingShape, mode, tempShape]);

  // toolbar handlers
  const handleAddShapes = (type: ShapeType) => {
    setActiveTool(type);
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
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.forEachObject((obj) => {
          obj.evented = true;
          obj.selectable = false;
        });
      }
    } else if (type === "grab") {
      setMode("grab");
      setDrawingShape(null);
      if (canvas) {
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        canvas.defaultCursor = "grab";
      }
    } else if (type === "freeDraw") {
      setMode("freeDraw");
      setDrawingShape("freeDraw");
      if (canvas) {
        canvas.isDrawingMode = true;
        canvas.selection = false;
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
    } else if (type === "text") {
      setMode("draw");
      setDrawingShape("text");
      if (canvas) {
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        canvas.defaultCursor = "text";
        canvas.hoverCursor = "text";
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

  // theme bg
  useEffect(() => {
    if (canvas) {
      canvas.backgroundColor = getCanvasBg();
      canvas.renderAll();
    }
  }, [theme, canvas]);

  return (
    <div className="relative w-full h-full">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-auto max-w-lg flex justify-center px-2 sm:px-0">
        <Toolbar activeTool={activeTool} onToolChange={handleAddShapes} />
      </div>
      <div className="absolute top-4 right-4 z-50 sm:hidden">
        <button
          onClick={() => setShowSidebar((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-md transition-colors bg-[#605ebc] text-white"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* ResponsiveSidebar handles both mobile & desktop behavior */}
      <ResponsiveSidebar
        zoomIn={() => {
          zoomIn(canvas!);
          setZoom(Math.round(canvas!.getZoom() * 100));
        }}
        zoomOut={() => {
          zoomOut(canvas!);
          setZoom(Math.round(canvas!.getZoom() * 100));
        }}
        resetZoom={() => {
          resetZoom(canvas!);
          setZoom(100);
        }}
        zoom={zoom}
      />

      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default CanvasBoard;
