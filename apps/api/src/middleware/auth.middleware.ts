import { NextFunction, Request, Response } from "express";
import { jwt } from "@repo/jwt";

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function protectedRoute(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.query.token as string;
    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
      id: string;
      email: string;
    };
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
