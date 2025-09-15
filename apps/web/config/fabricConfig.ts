import * as fabric from "fabric";

/**

 * @param canvas - The fabric.Canvas instance to configure
 */
export const applyFabricConfig = (canvas: fabric.Canvas) => {
  canvas.selection = true;
  canvas.selectionColor = "rgba(0, 120, 255, 0.05)";
  canvas.selectionBorderColor = "rgba(0, 120, 255, 0.8)";
  canvas.selectionLineWidth = 1.5;
  canvas.selectionDashArray = [5, 3];

  fabric.Object.prototype.borderColor = "rgba(0, 120, 255, 0.8)";
  fabric.Object.prototype.borderDashArray = [4, 2];
  fabric.Object.prototype.cornerColor = "#ffffff";
  fabric.Object.prototype.cornerStrokeColor = "rgba(0, 120, 255, 0.8)";
  fabric.Object.prototype.cornerStyle = "circle";
  fabric.Object.prototype.cornerSize = 10;
  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.padding = 5;
  fabric.Object.prototype.lockRotation = false;

  canvas.requestRenderAll();
};
