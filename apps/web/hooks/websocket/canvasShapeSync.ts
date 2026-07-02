import * as fabric from "fabric";
import type { FabricShapeJSON } from "@repo/zod/ws-messages";

type ShapeObject = fabric.FabricObject & { id?: string };

export async function applyShapeToCanvas(
  canvas: fabric.Canvas,
  shapeJSON: FabricShapeJSON
): Promise<void> {
  if (!shapeJSON?.id) return;

  const existingObject = canvas
    .getObjects()
    .find((obj) => (obj as ShapeObject).id === shapeJSON.id);

  try {
    const objects = await fabric.util.enlivenObjects([shapeJSON]);
    if (objects.length === 0) return;

    const nextObject = objects[0] as ShapeObject;
    nextObject.set({ selectable: false, evented: true });

    if (existingObject) {
      canvas.remove(existingObject);
    }
    canvas.add(nextObject);
    canvas.requestRenderAll();
  } catch (error) {
    console.error("Failed to apply shape to canvas:", error);
  }
}

export async function applyShapesToCanvas(
  canvas: fabric.Canvas,
  shapes: FabricShapeJSON[]
): Promise<void> {
  const canvasJSON = { version: fabric.version, objects: shapes };
  return new Promise((resolve) => {
    canvas.loadFromJSON(canvasJSON, () => {
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = true;
      });
      canvas.requestRenderAll();
      resolve();
    });
  });
}

export function deleteShapeFromCanvas(
  canvas: fabric.Canvas,
  shapeId: string
): void {
  const obj = canvas
    .getObjects()
    .find((o) => (o as ShapeObject).id === shapeId);
  if (!obj) return;
  canvas.remove(obj);
  canvas.requestRenderAll();
}
