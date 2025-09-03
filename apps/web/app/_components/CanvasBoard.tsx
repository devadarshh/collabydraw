"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useTheme } from "next-themes";

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
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
    if (canvas) {
      canvas.backgroundColor = getCanvasBg();
      canvas.renderAll();
    }
  }, [theme, canvas]);

  return (
    <div className="relative w-screen h-screen">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default CanvasBoard;
