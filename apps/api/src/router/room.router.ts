import express, { Router } from "express";
import { protectedRoute } from "../middleware/auth.middleware";
import { handleCreateRoom } from "../controller/room.controller";
const router: Router = express.Router();

router.post("/create-room", protectedRoute, handleCreateRoom);

export default router;
