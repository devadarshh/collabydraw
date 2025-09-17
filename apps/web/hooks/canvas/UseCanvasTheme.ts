import { useEffect } from "react";
import type { Canvas } from "fabric";

interface UseCanvasThemeProps {
  canvas: Canvas | null;
}

export function useCanvasTheme({ canvas }: UseCanvasThemeProps): void {
  useEffect(() => {
    if (!canvas) return;

    const updateBackground = () => {
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-background")
        .trim();
      canvas.backgroundColor = bgColor || "#ffffff";
      canvas.renderAll();
    };

    updateBackground();

    const observer = new MutationObserver(updateBackground);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [canvas]);
}
