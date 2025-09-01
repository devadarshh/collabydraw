import { WebSocketServer } from "ws";
import { jwt } from "@repo/jwt";

const PORT = process.env.WS_PORT || 8080;
const wss = new WebSocketServer({ port: Number(PORT) });

wss.on("connection", (ws, req) => {
  // console.log("client connected");
  // const url = req.url;
  // if (!url) {
  //   console.error("No Valid Url found in the request");
  //   return;
  // }
  // const queryParams = new URLSearchParams(url?.split("?")[1]);
  // const token = queryParams.get("token");
  // if (!token || token == null) {
  //   console.error("No Valid Url found in the request");
  //   ws.close();
  //   return;
  // }
  ws.send("Hii ");
});
