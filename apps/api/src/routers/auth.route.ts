import express, { Router } from "express";
import { handleRegisterUser } from "../controllers/auth.controller";
const router: Router = express.Router();

router.post("/register", handleRegisterUser);

export default router;
