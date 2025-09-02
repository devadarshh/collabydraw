import { WebSocketServer, WebSocket } from "ws";
import { prisma } from "@repo/db/prisma";
import { jwt } from "@repo/jwt";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.WS_PORT || 8080;
const wss = new WebSocketServer({ port: Number(PORT) });

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

type ClientMessage = { type: "JOIN_ROOM"; roomId: string };

type ServerMessage =
  | { type: "ROOM_JOINED"; roomId: string }
  | { type: "ERROR"; message: string };

const users: Map<string, User> = new Map();
const rooms: Map<string, Room> = new Map();

if (!process.env.JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY is ABSOLUTELY REQUIRED");
}
interface JwtPayload {
  id: string;
  email: string;
  name: string;
}
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

function authUser(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;

    if (!decoded.id) {
      console.error("No valid user ID in token");
      return null;
    }

    return {
      userId: decoded.id,
      userName: decoded.name ?? "Anonymous",
      email: decoded.email ?? "",
    };
  } catch (error) {
    console.error("Verification failed!", error);
    return null;
  }
}

wss.on("connection", (ws, req) => {
  console.log("User Connected!");
  const url = req.url;
  if (!url) {
    console.error("No Valid Url found in the request");
    return;
  }
  const queryParams = new URLSearchParams(url?.split("?")[1]);
  const token = queryParams.get("token");
  const initialRoomId = queryParams.get("room");

  if (!token || !initialRoomId) {
    console.error("No Valid Token or Room ID Found");
    ws.close();
    return;
  }
  const userData = authUser(token);

  if (!userData) {
    console.error("connection rejected of invalid user");
    ws.close(1008, "user not authenticated!");
    return;
  }

  // store user in memory
  const user: User = {
    userId: userData.userId,
    userName: userData.userName,
    ws,
    roomId: null,
  };
  users.set(user.userId, user);

  ws.on("message", async (data) => {
    const parsedData: ClientMessage = JSON.parse(data.toString());

    if (parsedData.type === "JOIN_ROOM") {
      const isRoomExist = await prisma.room.findUnique({
        where: { id: parsedData.roomId },
      });

      if (!isRoomExist) {
        console.error("No Room Id Found!");
        ws.send(
          JSON.stringify({ type: "ERROR", message: "Room does not exist" })
        );
        return;
      }

      let room = rooms.get(parsedData.roomId);

      if (!room) {
        room = {
          roomId: parsedData.roomId,
          users: [],
          admin: user.userId,
          createdAt: Date.now(),
        };
        rooms.set(parsedData.roomId, room);
      }

      room.users.push(user);
      user.roomId = parsedData.roomId;

      ws.send(
        JSON.stringify({ type: "ROOM_JOINED", roomId: parsedData.roomId })
      );
      console.log(`${user.userName} joined room ${parsedData.roomId}`);
    }
  });
});
