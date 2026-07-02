import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./router/auth.route";
import roomRoutes from "./router/room.router";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [
        "https://collabydraw-web.vercel.app",
      ];

      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

app.use(express.json());

app.use("/api/v1/", authRoutes);
app.use("/api/v1/rooms", roomRoutes);

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(` Server running at PORT ${PORT}`);
});
