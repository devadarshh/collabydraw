import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./router/auth.route";
import roomRoutes from "./router/room.router";
dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8080"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"], // ← important
  })
);
app.use(express.json());

const PORT = process.env.PORT || 9000;

app.use("/api/v1", authRoutes);
app.use("/api/v1", roomRoutes);

app.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
