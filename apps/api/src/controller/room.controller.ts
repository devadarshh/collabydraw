import { Request, Response } from "express";

import { createRoomSchema } from "@repo/zod/schema";
import { prisma } from "@repo/db/prisma";

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}
export const handleCreateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = createRoomSchema.safeParse({ userId });
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: parsed.error,
      });
    }
    const newRoom = await prisma.room.create({ data: { adminId: userId } });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: newRoom,
    });
  } catch (error) {
    console.error("Create Room error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
