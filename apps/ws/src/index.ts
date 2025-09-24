import { WebSocketServer, WebSocket } from "ws";
import { prisma } from "@repo/db/prisma";
import { jwt } from "@repo/jwt/config";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.WS_PORT || 8080;
const wss = new WebSocketServer({ port: Number(PORT) });

// ------------------- TYPES -------------------
type ShapeData = {
  id: string;
  type: string; // rectangle, ellipse, line, freeDraw, etc
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  points?: { x: number; y: number }[];
  text?: string;
};

type User = {
  userId: string;
  userName: string;
  ws: WebSocket;
  roomId: string | null;
};

type Room = {
  roomId: string;
  users: User[];
  admin: string;
  createdAt: number;
};

type ClientMessage =
  | { type: "JOIN_ROOM"; roomId: string }
  | { type: "LEAVE_ROOM"; roomId: string }
  | { type: "CREATE_SHAPE"; roomId: string; shape: ShapeData }
  | { type: "DELETE_SHAPE"; roomId: string; shapeId: string };

type ServerMessage =
  | { type: "ROOM_JOINED"; roomId: string; message: string }
  | { type: "ROOM_LEAVED"; roomId: string; message: string }
  | {
      type: "USER_LEFT";
      userId: string;
      userName: string;
      participants: { userId: string; userName: string }[];
    }
  | { type: "NEW_SHAPE"; shape: ShapeData }
  | { type: "LOAD_SHAPES"; shapes: ShapeData[] }
  | { type: "ERROR"; message: string };

let users: User[] = [];
let rooms: Room[] = [];

if (!process.env.JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY is ABSOLUTELY REQUIRED");
}
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

interface JwtPayload {
  id: string;
  email: string;
  name: string;
}

// ------------------- AUTH -------------------
function authUser(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;

    if (!decoded.id) return null;

    return {
      userId: decoded.id,
      userName: decoded.name ?? "Anonymous",
      email: decoded.email ?? "",
    };
  } catch (error) {
    console.error("JWT verification failed", error);
    return null;
  }
}

// ------------------- UTILS -------------------
function getCurrentParticipantsInRoom(roomId: string) {
  const room = rooms.find((r) => r.roomId === roomId);
  if (!room) return [];
  return room.users.map((u) => ({ userId: u.userId, userName: u.userName }));
}

// ------------------- WEBSOCKET CONNECTION -------------------
wss.on("connection", (ws, req) => {
  ws.send("SUBSCRIBED");

  const url = req.url;
  if (!url) return ws.close();

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token");
  const roomId = queryParams.get("room");

  if (!token || !roomId) return ws.close();

  const userData = authUser(token);
  if (!userData) return ws.close(1008, "User not authenticated");

  const user: User = {
    userId: userData.userId,
    userName: userData.userName,
    ws,
    roomId: null,
  };
  users.push(user);

  ws.on("message", async (data) => {
    const parsedData: ClientMessage = JSON.parse(data.toString());

    // ------------------- JOIN ROOM -------------------
    if (parsedData.type === "JOIN_ROOM") {
      const isRoomExist = await prisma.room.findUnique({
        where: { id: roomId },
      });
      if (!isRoomExist) {
        ws.send(
          JSON.stringify({ type: "ERROR", message: "Room does not exist" })
        );
        return;
      }

      let room = rooms.find((r) => r.roomId === roomId);
      if (!room) {
        room = { roomId, users: [], admin: user.userId, createdAt: Date.now() };
        rooms.push(room);
        console.log(`${user.userName} is admin of new room ${roomId}`);
      }

      if (!room.users.some((u) => u.userId === user.userId)) {
        room.users.push(user);
        user.roomId = roomId;
      }

      ws.send(
        JSON.stringify({
          type: "ROOM_JOINED",
          roomId,
          message: "Room Joined Successfully",
        })
      );

      // ------------------- LOAD EXISTING SHAPES -------------------
      const existingShapes = await prisma.shape.findMany({ where: { roomId } });
      ws.send(
        JSON.stringify({
          type: "LOAD_SHAPES",
          shapes: existingShapes.map((s) => JSON.parse(s.message)),
        })
      );

      console.log(`${user.userName} joined room ${roomId}`);
    }

    // ------------------- LEAVE ROOM -------------------
    if (parsedData.type === "LEAVE_ROOM") {
      const room = rooms.find((r) => r.roomId === roomId);
      if (!room) return; // runtime guard

      room.users = room!.users.filter((u) => u.userId !== user.userId);
      user.roomId = null;

      if (room!.admin === user.userId && room!.users.length > 0) {
        // @ts-ignore
        room!.admin = room!.users[0].userId;
      } else if (room!.users.length === 0) {
        rooms = rooms.filter((r) => r.roomId !== room!.roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      }

      ws.send(
        JSON.stringify({
          type: "ROOM_LEAVED",
          roomId,
          message: "Room Left Successfully",
        })
      );

      const participants = getCurrentParticipantsInRoom(roomId);
      room.users.forEach((u) =>
        u.ws.send(
          JSON.stringify({
            type: "USER_LEFT",
            userId: user.userId,
            userName: user.userName,
            participants,
          })
        )
      );

      console.log(`${user.userName} left room ${roomId}`);
    }

    // ------------------- CREATE SHAPE -------------------
    if (parsedData.type === "CREATE_SHAPE") {
      const { roomId, shape } = parsedData;

      // Save in DB
      await prisma.shape.create({
        data: {
          id: shape.id,
          message: JSON.stringify(shape),
          roomId,
          userId: user.userId,
        },
      });

      // Broadcast to all users in room
      const room = rooms.find((r) => r.roomId === roomId);
      if (!room) return;

      room.users.forEach((u) =>
        u.ws.send(JSON.stringify({ type: "NEW_SHAPE", shape }))
      );
    } // DELETE_SHAPE
    if (parsedData.type === "DELETE_SHAPE") {
      const { roomId, shapeId } = parsedData;
      // Remove from DB
      await prisma.shape.delete({ where: { id: shapeId } });

      const room = rooms.find((r) => r.roomId === roomId);
      if (!room) return;

      // Broadcast delete to all users
      room.users.forEach((u) =>
        u.ws.send(JSON.stringify({ type: "DELETE_SHAPE", shapeId }))
      );
    }
  });

  ws.on("close", () => {
    // Optional: handle disconnect cleanup if needed
  });
});

console.log(`WebSocket server running on port ${PORT}`);
