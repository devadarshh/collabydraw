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
      if (!evt.ctrlKey && !evt.metaKey) return;

      let zoom = canvas.getZoom();
      zoom *= 1 - evt.deltaY / 1000;
      if (zoom > 5) zoom = 5;
      if (zoom < 0.5) zoom = 0.5;

      const point = new fabric.Point(evt.offsetX, evt.offsetY);
      canvas.zoomToPoint(point, zoom);

      evt.preventDefault();
      evt.stopPropagation();
      setZoom(Math.round(canvas.getZoom() * 100));
    };

    canvas.on("mouse:wheel", wheelHandler);
    return () => {
      canvas.off("mouse:wheel", wheelHandler);
    };
  }, [canvas, setZoom]);
}
