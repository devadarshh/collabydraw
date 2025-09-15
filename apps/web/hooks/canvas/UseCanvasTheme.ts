"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import type { Canvas } from "fabric";

interface UseCanvasThemeProps {
  canvas: Canvas | null;
}

export function useCanvasTheme({ canvas }: UseCanvasThemeProps): void {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!canvas) return;

    const bgColor = resolvedTheme === "dark" ? "#121212" : "#ffffff";
    canvas.backgroundColor = bgColor;
    canvas.renderAll();
  }, [canvas, resolvedTheme]);
}
