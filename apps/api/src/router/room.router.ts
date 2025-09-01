import express, { Router } from "express";
import { handleCreateRoom } from "../controller/room.controller";
import { protectedRoute } from "../middleware/auth.middleware";
const router: Router = express.Router();

router.post("/create-room", protectedRoute, handleCreateRoom);

export default router;
