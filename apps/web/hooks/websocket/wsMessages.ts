import * as fabric from "fabric";

export type CustomFabricObject = fabric.FabricObject & { id?: string };

export function serializeShape(shapeObject: CustomFabricObject): FabricShapeJSON {
  if (!shapeObject.id) {
    shapeObject.id = crypto.randomUUID();
  }
  const shapeJSON = shapeObject.toObject(["id"]) as FabricShapeJSON;
  if (process.env.NODE_ENV === "development") {
    console.assert(!!shapeJSON.id, "Shape JSON must include id");
  }
  return shapeJSON;
}

export type FabricShapeJSON = Record<string, unknown> & { id: string };

export function sendCreateShape(
  ws: WebSocket,
  roomId: string,
  shapeObject: CustomFabricObject
) {
  if (ws.readyState !== WebSocket.OPEN) return;
  const shape = serializeShape(shapeObject);
  ws.send(JSON.stringify({ type: "CREATE_SHAPE", roomId, shape }));
}

export function sendDeleteShape(
  ws: WebSocket,
  roomId: string,
  shapeId: string
) {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ type: "DELETE_SHAPE", roomId, shapeId }));
}

export function removeObjectFromCanvas(
  canvas: fabric.Canvas,
  obj: CustomFabricObject,
  opts?: {
    ws?: WebSocket | null;
    roomId?: string | null;
    isInRoom?: boolean;
  }
) {
  const shapeId = obj.id;
  canvas.remove(obj);
  canvas.discardActiveObject();
  canvas.requestRenderAll();

  if (opts?.ws && opts?.isInRoom && opts?.roomId && shapeId) {
    sendDeleteShape(opts.ws, opts.roomId, shapeId);
  }
}
