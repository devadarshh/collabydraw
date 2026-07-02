import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { prisma } from "@repo/db/prisma";
import { jwt } from "@repo/jwt/config";
import {
  type ClientMessage,
  type Participant,
  parseShapeMessage,
} from "@repo/zod/ws-messages";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const PORT = process.env.WS_PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", timestamp: Date.now() }));
    return;
  }

  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

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

function getCurrentParticipantsInRoom(roomId: string): Participant[] {
  const room = rooms.find((r) => r.roomId === roomId);
  if (!room) return [];
  return room.users.map((u) => ({ userId: u.userId, userName: u.userName }));
}

function broadcastToRoom(
  roomId: string,
  message: unknown,
  excludeUserId?: string
) {
  const room = rooms.find((r) => r.roomId === roomId);
  if (!room) return;
  const payload = JSON.stringify(message);
  room.users.forEach((u) => {
    if (excludeUserId && u.userId === excludeUserId) return;
    u.ws.send(payload);
  });
}

function removeUserFromRoom(user: User, connectionRoomId: string) {
  const room = rooms.find((r) => r.roomId === connectionRoomId);
  if (!room) return;

  room.users = room.users.filter((u) => u.userId !== user.userId);
  user.roomId = null;

  if (room.admin === user.userId && room.users.length > 0) {
    room.admin = room.users[0]!.userId;
  } else if (room.users.length === 0) {
    rooms = rooms.filter((r) => r.roomId !== room.roomId);
    console.log(`Room ${connectionRoomId} deleted (empty)`);
    return;
  }

  const participants = getCurrentParticipantsInRoom(connectionRoomId);
  broadcastToRoom(connectionRoomId, {
    type: "USER_LEFT",
    userId: user.userId,
    userName: user.userName,
    participants,
  });
}

wss.on("connection", (ws, req) => {
  ws.send("SUBSCRIBED");

  const url = req.url;
  if (!url) return ws.close();

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token");
  const connectionRoomId = queryParams.get("room");

  if (!token || !connectionRoomId) return ws.close();

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
    let parsedData: ClientMessage;
    try {
      parsedData = JSON.parse(data.toString()) as ClientMessage;
    } catch {
      ws.send(
        JSON.stringify({ type: "ERROR", message: "Invalid message format" })
      );
      return;
    }

    if (parsedData.type === "PING") {
      ws.send(JSON.stringify({ type: "PONG" }));
      return;
    }

    if (parsedData.type === "JOIN_ROOM") {
      if (parsedData.roomId !== connectionRoomId) {
        ws.send(
          JSON.stringify({ type: "ERROR", message: "Room ID mismatch" })
        );
        return;
      }

      const isRoomExist = await prisma.room.findUnique({
        where: { id: connectionRoomId },
      });
      if (!isRoomExist) {
        ws.send(
          JSON.stringify({ type: "ERROR", message: "Room does not exist" })
        );
        return;
      }

      let room = rooms.find((r) => r.roomId === connectionRoomId);
      const isNewJoiner = !room?.users.some((u) => u.userId === user.userId);

      if (!room) {
        room = {
          roomId: connectionRoomId,
          users: [],
          admin: user.userId,
          createdAt: Date.now(),
        };
        rooms.push(room);
        console.log(`${user.userName} is admin of new room ${connectionRoomId}`);
      }

      if (!room.users.some((u) => u.userId === user.userId)) {
        room.users.push(user);
        user.roomId = connectionRoomId;
      }

      ws.send(
        JSON.stringify({
          type: "ROOM_JOINED",
          roomId: connectionRoomId,
          message: "Room Joined Successfully",
          participants: getCurrentParticipantsInRoom(connectionRoomId),
        })
      );

      const existingShapes = await prisma.shape.findMany({
        where: { roomId: connectionRoomId },
      });
      ws.send(
        JSON.stringify({
          type: "LOAD_SHAPES",
          shapes: existingShapes.map((s) => parseShapeMessage(s.message)),
        })
      );

      if (isNewJoiner) {
        broadcastToRoom(
          connectionRoomId,
          {
            type: "USER_JOINED",
            userId: user.userId,
            userName: user.userName,
            participants: getCurrentParticipantsInRoom(connectionRoomId),
          },
          user.userId
        );
      }

      console.log(`${user.userName} joined room ${connectionRoomId}`);
      return;
    }

    if (parsedData.type === "LEAVE_ROOM") {
      if (parsedData.roomId !== connectionRoomId) {
        ws.send(
          JSON.stringify({ type: "ERROR", message: "Room ID mismatch" })
        );
        return;
      }

      removeUserFromRoom(user, connectionRoomId);

      ws.send(
        JSON.stringify({
          type: "ROOM_LEAVED",
          roomId: connectionRoomId,
          message: "Room Left Successfully",
        })
      );

      console.log(`${user.userName} left room ${connectionRoomId}`);
      return;
    }

    if (parsedData.type === "CREATE_SHAPE") {
      if (parsedData.roomId !== connectionRoomId) {
        ws.send(
          JSON.stringify({ type: "ERROR", message: "Room ID mismatch" })
        );
        return;
      }
      if (!user.roomId || user.roomId !== connectionRoomId) {
        ws.send(
          JSON.stringify({ type: "ERROR", message: "Join the room first" })
        );
        return;
      }

      const { shape } = parsedData;
      if (!shape?.id) {
        ws.send(
          JSON.stringify({ type: "ERROR", message: "Shape must have an id" })
        );
        return;
      }

      await prisma.shape.upsert({
        where: { id: shape.id },
        update: { message: shape as object },
        create: {
          id: shape.id,
          message: shape as object,
          roomId: connectionRoomId,
          userId: user.userId,
        },
      });

      broadcastToRoom(connectionRoomId, { type: "NEW_SHAPE", shape });
      return;
    }

    if (parsedData.type === "DELETE_SHAPE") {
      if (parsedData.roomId !== connectionRoomId) {
        ws.send(
          JSON.stringify({ type: "ERROR", message: "Room ID mismatch" })
        );
        return;
      }
      if (!user.roomId || user.roomId !== connectionRoomId) {
        ws.send(
          JSON.stringify({ type: "ERROR", message: "Join the room first" })
        );
        return;
      }

      const { shapeId } = parsedData;
      try {
        await prisma.shape.delete({ where: { id: shapeId } });
      } catch (error) {
        console.error("Failed to delete shape:", error);
        ws.send(JSON.stringify({ type: "ERROR", message: "Shape not found" }));
        return;
      }

      broadcastToRoom(connectionRoomId, { type: "DELETE_SHAPE", shapeId });
    }
  });

  ws.on("close", () => {
    users = users.filter((u) => u !== user);
    if (user.roomId) {
      removeUserFromRoom(user, user.roomId);
    }
  });
});

server.listen(Number(PORT), () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
