import { JWT_SECRET } from "@repo/jwt/config";
import { jwt } from "@repo/jwt";
import { NextFunction, Request, Response } from "express";

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}
export const protectedRoute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"] ?? "";
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing" });
    }

    const token = authHeader.split("")[1];
    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET as string) as {
      id: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
