import express, { Router } from "express";
import {
  handleGuestSession,
  handleLoginUser,
  handleRegisterUser,
} from "../controller/auth.controller";
const router: Router = express.Router();

router.post("/register", handleRegisterUser);
router.post("/login", handleLoginUser);
router.post("/guest", handleGuestSession);

export default router;
