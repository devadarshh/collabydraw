import { FabricObject, Textbox, type Canvas } from "fabric";

FabricObject.customProperties = ["id"];

export const loadExcalifont = () => {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  return document.fonts.load('16px "Excalifont"');
};

/**
 * @param canvas
 */
export const applyFabricConfig = (canvas: Canvas) => {
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

  FabricObject.prototype.borderColor = primaryColor;
  FabricObject.prototype.borderDashArray = [4, 2];
  FabricObject.prototype.cornerColor = foregroundColor;
  FabricObject.prototype.cornerStrokeColor = primaryColor;
  FabricObject.prototype.cornerStyle = "circle";
  FabricObject.prototype.cornerSize = 10;
  FabricObject.prototype.transparentCorners = false;
  FabricObject.prototype.padding = 5;
  FabricObject.prototype.lockRotation = false;

  Textbox.prototype.fontFamily = "Excalifont";

  canvas.requestRenderAll();
};
