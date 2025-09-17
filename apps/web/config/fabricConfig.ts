import * as fabric from "fabric";

/**
 * @param canvas
 */
export const applyFabricConfig = (canvas: fabric.Canvas) => {
  const getCssVar = (name: string, fallback: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback;

  const primaryColor = getCssVar("--color-primary", "rgba(0, 120, 255, 0.8)");
  const foregroundColor = getCssVar("--color-foreground", "#ffffff");

  canvas.selection = true;
  canvas.selectionColor = "rgba(0, 120, 255, 0.05)";
  canvas.selectionBorderColor = primaryColor;
  canvas.selectionLineWidth = 1.5;
  canvas.selectionDashArray = [5, 3];

  fabric.Object.prototype.borderColor = primaryColor;
  fabric.Object.prototype.borderDashArray = [4, 2];
  fabric.Object.prototype.cornerColor = foregroundColor;
  fabric.Object.prototype.cornerStrokeColor = primaryColor;
  fabric.Object.prototype.cornerStyle = "circle";
  fabric.Object.prototype.cornerSize = 10;
  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.padding = 5;
  fabric.Object.prototype.lockRotation = false;

  fabric.Text.prototype.fontFamily = "Excalifont";

  canvas.requestRenderAll();
};
