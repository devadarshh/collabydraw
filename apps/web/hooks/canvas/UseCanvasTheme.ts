import { useEffect } from "react";
import type { Canvas } from "fabric";
import { applyFabricConfig } from "@/config/fabricConfig";

interface UseCanvasThemeProps {
  canvas: Canvas | null;
}

export function useCanvasTheme({ canvas }: UseCanvasThemeProps): void {
  useEffect(() => {
    if (!canvas) return;

    const syncFabricTheme = () => {
      applyFabricConfig(canvas);
    };

    syncFabricTheme();

    const observer = new MutationObserver(syncFabricTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [canvas]);
}
