"use client";

import { useEffect } from "react";
import * as fabric from "fabric";
import { useTheme } from "next-themes";

interface UseCanvasThemeProps {
  canvas: fabric.Canvas | null;
}

export function useCanvasTheme({ canvas }: UseCanvasThemeProps) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!canvas || !resolvedTheme) return;

    canvas.backgroundColor = resolvedTheme === "dark" ? "#121212" : "#ffffff";
    canvas.renderAll();
  }, [canvas, resolvedTheme]);
}
