import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./router/auth.route";
dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8080"],
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 9000;

app.use("/api/v1", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
