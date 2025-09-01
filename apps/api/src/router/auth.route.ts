import express, { Router } from "express";
import {
  handleLoginUser,
  handleRegisterUser,
} from "../controller/auth.controller";
const router: Router = express.Router();

router.post("/register", handleRegisterUser);
router.post("/login", handleLoginUser);

export default router;
