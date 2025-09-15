"use client";
import * as fabric from "fabric";
import { useEffect } from "react";
import type { Canvas, TEvent, Point } from "fabric";

export function useCanvasZoom(
  canvas: Canvas | null,
  setZoom: (zoom: number) => void
): void {
  useEffect(() => {
    if (!canvas) return;

    const wheelHandler = (opt: TEvent<WheelEvent>) => {
      const evt = opt.e as WheelEvent;

      if (!evt.ctrlKey && !evt.metaKey) return;

      evt.preventDefault();
      evt.stopPropagation();

      let zoom = canvas.getZoom();
      const zoomFactor = 0.05;
      zoom *= evt.deltaY < 0 ? 1 + zoomFactor : 1 - zoomFactor;

      zoom = Math.min(Math.max(zoom, 0.2), 5);

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
