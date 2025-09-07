"use client";
import { useEffect } from "react";
import * as fabric from "fabric";
import { useTheme } from "next-themes";

interface UseCanvasThemeProps {
  canvas: fabric.Canvas | null;
}

export function useCanvasTheme({ canvas }: UseCanvasThemeProps) {
  const { theme } = useTheme();

  const themeColors: Record<"light" | "dark", string> = {
    light: "#ffffff",
    dark: "#121212",
  };

  const getCanvasBg = (): string => {
    return theme === "dark" ? themeColors.dark : themeColors.light;
  };

  useEffect(() => {
    if (!canvas) return;
    canvas.backgroundColor = getCanvasBg();
    canvas.renderAll();
  }, [theme, canvas]);
}
