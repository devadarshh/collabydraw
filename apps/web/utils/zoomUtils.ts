import * as fabric from "fabric";

export const zoomIn = (canvas: fabric.Canvas) => {
  let zoom = canvas.getZoom();
  zoom = Math.min(zoom * 1.1, 5);
  canvas.setZoom(zoom);
};

export const zoomOut = (canvas: fabric.Canvas) => {
  let zoom = canvas.getZoom();
  zoom = Math.max(zoom / 1.1, 0.5);
  canvas.setZoom(zoom);
};

export const resetZoom = (canvas: fabric.Canvas) => {
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
};
