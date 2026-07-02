import * as fabric from "fabric";
import type { CustomFabricObject } from "../websocket/wsMessages";

function isPointInPolygonObject(
  obj: fabric.Polygon,
  pointer: fabric.Point
): boolean {
  const points = obj.points ?? [];
  if (points.length < 3) return false;

  const matrix = obj.calcTransformMatrix();
  const scenePoints = points.map((p) =>
    fabric.util.transformPoint(new fabric.Point(p.x, p.y), matrix)
  );

  return fabric.Intersection.isPointInPolygon(pointer, scenePoints);
}

export function findEraserTarget(
  canvas: fabric.Canvas,
  e: fabric.TPointerEvent
): CustomFabricObject | undefined {
  const fromTargetFind = canvas.findTarget(e) as CustomFabricObject | undefined;
  if (fromTargetFind) return fromTargetFind;

  const pointer = canvas.getScenePoint(e);
  const objects = canvas.getObjects().slice().reverse();

  for (const obj of objects) {
    if (!obj.evented || !obj.visible) continue;

    if (obj.type === "polygon") {
      if (isPointInPolygonObject(obj as fabric.Polygon, pointer)) {
        return obj as CustomFabricObject;
      }
      continue;
    }

    if (obj.containsPoint(pointer)) {
      return obj as CustomFabricObject;
    }
  }

  return undefined;
}
