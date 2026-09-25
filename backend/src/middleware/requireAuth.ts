import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export default function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(" ") ?? [];
  const secret = process.env.JWT_SECRET;

  if (scheme !== "Bearer" || !token || !secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== "object" || decoded === null || typeof decoded.userId !== "number") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.userId = decoded.userId;
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
