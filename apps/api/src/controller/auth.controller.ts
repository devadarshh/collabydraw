import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { registerSchema } from "@repo/zod/schema";
import generateJWTToken from "@repo/jwt/generateJWT";
import { prisma } from "@repo/db/prisma";

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

    const token = generateJWTToken({ id: newUser.id, email: newUser.email });

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
