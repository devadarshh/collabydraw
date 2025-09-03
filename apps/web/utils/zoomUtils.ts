import * as fabric from "fabric";

export const handleMouseWheelZoom = (
  opt: fabric.TEvent<WheelEvent>,
  canvas: fabric.Canvas
) => {
  const wheelHandler = (opt: fabric.TEvent<WheelEvent>) => {
    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();

    zoom *= 0.999 ** delta;
    if (zoom > 5) zoom = 5;
    if (zoom < 0.5) zoom = 0.5;

    const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
    canvas.zoomToPoint(point, zoom);

    opt.e.preventDefault();
    opt.e.stopPropagation();
  };

  canvas.on("mouse:wheel", wheelHandler);

  return () => {
    canvas.off("mouse:wheel", wheelHandler);
  };
};

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
