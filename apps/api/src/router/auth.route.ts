import express, { Router } from "express";
import { handleRegisterUser } from "../controller/auth.controller";
const router: Router = express.Router();

router.post("/register", handleRegisterUser);

export default router;
