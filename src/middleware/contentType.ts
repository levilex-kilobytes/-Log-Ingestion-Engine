import { Request, Response, NextFunction } from "express";

export function contentTypeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.method === "POST" && req.path === "/logs") {
    if (!req.is("application/json")) {
      res.status(415).json({
        error: "Content-Type must be application/json",
      });
      return;
    }
  }

  next();
}
