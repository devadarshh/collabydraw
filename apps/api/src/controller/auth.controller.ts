import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { registerSchema, loginSchema } from "@repo/zod/schema";
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
