export type FabricShapeJSON = Record<string, unknown> & { id: string };

export type Participant = { userId: string; userName: string };

export type ClientMessage =
  | { type: "JOIN_ROOM"; roomId: string }
  | { type: "LEAVE_ROOM"; roomId: string }
  | { type: "CREATE_SHAPE"; roomId: string; shape: FabricShapeJSON }
  | { type: "DELETE_SHAPE"; roomId: string; shapeId: string };

export type ServerMessage =
  | { type: "ROOM_JOINED"; roomId: string; message: string }
  | { type: "ROOM_LEAVED"; roomId: string; message: string }
  | {
      type: "USER_JOINED";
      userId: string;
      userName: string;
      participants: Participant[];
    }
  | {
      type: "USER_LEFT";
      userId: string;
      userName: string;
      participants: Participant[];
    }
  | { type: "NEW_SHAPE"; shape: FabricShapeJSON }
  | { type: "LOAD_SHAPES"; shapes: FabricShapeJSON[] }
  | { type: "DELETE_SHAPE"; shapeId: string }
  | { type: "ERROR"; message: string };

export function parseShapeMessage(message: unknown): FabricShapeJSON {
  if (message == null) {
    throw new Error("Shape message is empty");
  }
  if (typeof message === "string") {
    return JSON.parse(message) as FabricShapeJSON;
  }
  return message as FabricShapeJSON;
}
