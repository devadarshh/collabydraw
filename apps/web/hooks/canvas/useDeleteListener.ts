import { useEffect } from "react";
import * as fabric from "fabric";

export function useDeleteListener(canvas: fabric.Canvas | null): void {
  useEffect(() => {
    if (!canvas) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObjects: fabric.Object[] = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach((object) => {
            canvas.remove(object);
          });
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canvas]);
}
