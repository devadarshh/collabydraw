import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { registerSchema, loginSchema, guestSessionSchema } from "@repo/zod/schema";
import { prisma } from "@repo/db/prisma";
import generateJWTToken from "@repo/jwt/generateJWT";

export const handleRegisterUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: parsed.error,
      });
    }
    const userExisted = await prisma.user.findFirst({
      where: { email },
    });
    if (userExisted) {
      return res.status(400).json({
        success: false,
        message: "User Already Existed!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    const token = generateJWTToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    return res.status(201).json({
      success: true,
      message: "User Created Successfully!",
      data: newUser,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const handleLoginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: parsed.error,
      });
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist!",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      user?.password as string
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: "false", message: "Invalid Password " });
    }

    const token = generateJWTToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    return res.json({
      success: true,
      message: "Login successful",
      data: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Sign In error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const handleGuestSession = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.body;
    const parsed = guestSessionSchema.safeParse({ roomId });
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: parsed.error,
      });
    }

    if (roomId) {
      const existingRoom = await prisma.room.findUnique({
        where: { id: roomId },
      });
      if (!existingRoom) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }
    }

    const guestNumber = Math.floor(1000 + Math.random() * 9000);
    const name = `Guest ${guestNumber}`;
    const email = `guest-${crypto.randomUUID()}@demo.collabydraw.local`;
    const hashedPassword = await bcrypt.hash(crypto.randomUUID(), 10);

    const guestUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    let sessionRoomId = roomId;
    if (!sessionRoomId) {
      const newRoom = await prisma.room.create({
        data: { adminId: guestUser.id },
      });
      sessionRoomId = newRoom.id;
    }

    const token = generateJWTToken({
      id: guestUser.id,
      email: guestUser.email,
      name: guestUser.name,
    });

    return res.status(201).json({
      success: true,
      message: "Guest session created",
      data: { id: guestUser.id, name: guestUser.name, email: guestUser.email },
      token,
      roomId: sessionRoomId,
    });
  } catch (error) {
    console.error("Guest session error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
