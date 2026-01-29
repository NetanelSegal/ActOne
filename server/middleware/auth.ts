import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Session {
      userId?: number;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session?.userId == null) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
