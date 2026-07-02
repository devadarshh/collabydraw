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

function resolvePort(): number {
  // Prefer WS_PORT locally so we don't collide with the API on PORT=9000.
  // On Render, only PORT is set by the platform.
  const rawPort = process.env.WS_PORT ?? process.env.PORT;
  if (!rawPort) return 8080;

  const port = Number.parseInt(rawPort, 10);
  if (!Number.isInteger(port) || port < 0 || port >= 65536) {
    console.warn(`Invalid port "${rawPort}", falling back to 8080`);
    return 8080;
  }

  return port;
}

const PORT = resolvePort();

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
const disconnectGraceMs = 5000;
const disconnectTimers = new Map<WebSocket, ReturnType<typeof setTimeout>>();
const recentRoomMembers = new Map<string, Map<string, number>>();

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

  room.users = room.users.filter((u) => u.ws.readyState === WebSocket.OPEN);
  return room.users.map((u) => ({ userId: u.userId, userName: u.userName }));
}

function broadcastToRoom(
  roomId: string,
  message: unknown,
  excludeUserId?: string
) {
  const room = rooms.find((r) => r.roomId === roomId);
  if (!room) return;

  room.users = room.users.filter((u) => u.ws.readyState === WebSocket.OPEN);
  const payload = JSON.stringify(message);
  room.users.forEach((u) => {
    if (excludeUserId && u.userId === excludeUserId) return;
    u.ws.send(payload);
  });
}

function markRecentMember(roomId: string, userId: string) {
  if (!recentRoomMembers.has(roomId)) {
    recentRoomMembers.set(roomId, new Map());
  }
  recentRoomMembers.get(roomId)!.set(userId, Date.now());
}

function wasRecentMember(roomId: string, userId: string): boolean {
  const seenAt = recentRoomMembers.get(roomId)?.get(userId);
  if (!seenAt) return false;
  return Date.now() - seenAt < disconnectGraceMs;
}

function clearDisconnectTimer(ws: WebSocket) {
  const timer = disconnectTimers.get(ws);
  if (timer) {
    clearTimeout(timer);
    disconnectTimers.delete(ws);
  }
}

function scheduleRemoveUserFromRoom(user: User, connectionRoomId: string) {
  clearDisconnectTimer(user.ws);
  const timer = setTimeout(() => {
    disconnectTimers.delete(user.ws);
    removeUserFromRoom(user, connectionRoomId);
  }, disconnectGraceMs);
  disconnectTimers.set(user.ws, timer);
}
function removeUserFromRoom(user: User, connectionRoomId: string) {
  const room = rooms.find((r) => r.roomId === connectionRoomId);
  if (!room) return;

  const activeEntry = room.users.find((u) => u.userId === user.userId);
  if (!activeEntry || activeEntry.ws !== user.ws) {
    return;
  }

  room.users = room.users.filter((u) => u.ws !== user.ws);
  user.roomId = null;
  markRecentMember(connectionRoomId, user.userId);

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

async function joinUserToRoom(
  user: User,
  roomId: string,
  options?: { resync?: boolean }
): Promise<boolean> {
  const alreadyJoined =
    user.roomId === roomId &&
    rooms
      .find((r) => r.roomId === roomId)
      ?.users.some((u) => u.ws === user.ws);

  if (alreadyJoined && !options?.resync) {
    return true;
  }

  const isRoomExist = await prisma.room.findUnique({
    where: { id: roomId },
  });
  if (!isRoomExist) {
    user.ws.send(
      JSON.stringify({ type: "ERROR", message: "Room does not exist" })
    );
    return false;
  }

  let room = rooms.find((r) => r.roomId === roomId);

  if (!room) {
    room = {
      roomId,
      users: [],
      admin: user.userId,
      createdAt: Date.now(),
    };
    rooms.push(room);
    console.log(`${user.userName} is admin of new room ${roomId}`);
  }

  const existingUserIndex = room.users.findIndex(
    (u) => u.userId === user.userId
  );
  const isReconnect = wasRecentMember(roomId, user.userId);
  const isNewJoiner = existingUserIndex < 0 && !isReconnect;

  if (existingUserIndex >= 0) {
    room.users[existingUserIndex] = user;
  } else {
    room.users.push(user);
  }
  user.roomId = roomId;
  clearDisconnectTimer(user.ws);

  user.ws.send(
    JSON.stringify({
      type: "ROOM_JOINED",
      roomId,
      message: "Room Joined Successfully",
      participants: getCurrentParticipantsInRoom(roomId),
    })
  );

  const existingShapes = await prisma.shape.findMany({
    where: { roomId },
  });
  user.ws.send(
    JSON.stringify({
      type: "LOAD_SHAPES",
      shapes: existingShapes.map((s) => parseShapeMessage(s.message)),
    })
  );

  if (isNewJoiner) {
    broadcastToRoom(
      roomId,
      {
        type: "USER_JOINED",
        userId: user.userId,
        userName: user.userName,
        participants: getCurrentParticipantsInRoom(roomId),
      },
      user.userId
    );
    console.log(`${user.userName} joined room ${roomId}`);
  }

  return true;
}

async function ensureUserInRoom(user: User, roomId: string): Promise<boolean> {
  if (user.roomId === roomId) {
    return true;
  }
  return joinUserToRoom(user, roomId);
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

  const pendingJoin = joinUserToRoom(user, connectionRoomId).catch((error) => {
    console.error("Auto-join failed:", error);
    return false;
  });

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

      await joinUserToRoom(user, connectionRoomId, { resync: true });
      return;
    }

    if (parsedData.type === "LEAVE_ROOM") {
      if (parsedData.roomId !== connectionRoomId) {
        ws.send(
          JSON.stringify({ type: "ERROR", message: "Room ID mismatch" })
        );
        return;
      }

      clearDisconnectTimer(user.ws);
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

      await pendingJoin;
      if (!(await ensureUserInRoom(user, connectionRoomId))) {
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

      const newShapeMessage = { type: "NEW_SHAPE" as const, shape };
      broadcastToRoom(connectionRoomId, newShapeMessage);
      return;
    }

    if (parsedData.type === "DELETE_SHAPE") {
      if (parsedData.roomId !== connectionRoomId) {
        ws.send(
          JSON.stringify({ type: "ERROR", message: "Room ID mismatch" })
        );
        return;
      }

      await pendingJoin;
      if (!(await ensureUserInRoom(user, connectionRoomId))) {
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
      scheduleRemoveUserFromRoom(user, user.roomId);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
