import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./router/auth.route";
import roomRoutes from "./router/room.router";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8080",
      "https://collabydraw-web.vercel.app",
    ],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/rooms", roomRoutes);

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(` Server running at PORT ${PORT}`);
});
