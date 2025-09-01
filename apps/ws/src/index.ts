import { WebSocketServer } from "ws";
import { jwt } from "@repo/jwt";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.WS_PORT || 8080;
const wss = new WebSocketServer({ port: Number(PORT) });

if (!process.env.JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY is ABSOLUTELY REQUIRED");
}
interface JwtPayload {
  id: string;
  email?: string;
}
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

function authUser(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;
    if (!decoded.id) {
      console.error("No valid user ID in token");
      return null;
    }
    return decoded.id;
  } catch (error) {
    console.error("Verification failed !");
    return null;
  }
}

wss.on("connection", (ws, req) => {
  console.log("client connected");
  const url = req.url;
  if (!url) {
    console.error("No Valid Url found in the request");
    return;
  }
  const queryParams = new URLSearchParams(url?.split("?")[1]);
  const token = queryParams.get("token");
  if (!token || token == null) {
    console.error("No Valid Token Found");
    ws.close();
    return;
  }
  const userId = authUser(token);

  if (!userId) {
    console.error("connection rejected as of invalid user");
    ws.close(1008, "user not authenticated!");
    return;
  }
  ws.send("Hii ");
});
