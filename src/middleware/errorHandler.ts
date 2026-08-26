import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: Error & { status?: number; type?: string },
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (error.type === "entity.too.large") {
    res.status(413).json({
      error: "Payload Too Large",
    });
    return;
  }

  if (error instanceof SyntaxError) {
    res.status(400).json({
      error: "Malformed JSON",
    });
    return;
  }

  next(error);
}
