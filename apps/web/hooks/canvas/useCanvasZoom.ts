"use client";
import { useEffect } from "react";
import * as fabric from "fabric";

export function useCanvasZoom(
  canvas: fabric.Canvas | null,
  setZoom: (zoom: number) => void
) {
  useEffect(() => {
    if (!canvas) return;

    const wheelHandler = (opt: fabric.TEvent<WheelEvent>) => {
      const evt = opt.e as WheelEvent;

      // Only zoom if Ctrl (or Cmd) is pressed
      if (!evt.ctrlKey && !evt.metaKey) return;

      evt.preventDefault();
      evt.stopPropagation();

      // Calculate zoom factor
      let zoom = canvas.getZoom();
      const zoomFactor = 0.05; // 5% per scroll step
      zoom *= evt.deltaY < 0 ? 1 + zoomFactor : 1 - zoomFactor;

      // Clamp zoom
      zoom = Math.min(Math.max(zoom, 0.2), 5);

      // Use canvas coordinates
      const rect = canvas.getElement().getBoundingClientRect();
      const pointer = new fabric.Point(
        evt.clientX - rect.left,
        evt.clientY - rect.top
      );

      canvas.zoomToPoint(pointer, zoom);
      setZoom(Math.round(zoom * 100));
    };

    canvas.on("mouse:wheel", wheelHandler);

    return () => {
      canvas.off("mouse:wheel", wheelHandler);
    };
  }, [canvas, setZoom]);
}
