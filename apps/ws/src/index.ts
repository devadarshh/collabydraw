import { WebSocketServer } from "ws";
import { jwt } from "@repo/jwt";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.WS_PORT || 8080;
const wss = new WebSocketServer({ port: Number(PORT) });

type User = {
  userId: string;
  userName: string;
  ws: WebSocket;
  roomId: string;
};

type Room = {
  roomId: string;
  users: User[];
  admin: string;
  createdAt: number;
};

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
    console.log("Decoded token on websocket server:", decoded);

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
  if (!token) {
    console.error("No Valid Token Found");
    ws.close();
    return;
  }
  const userData = authUser(token);

  if (!userData) {
    console.error("connection rejected of invalid user");
    ws.close(1008, "user not authenticated!");
    return;
  }
});
