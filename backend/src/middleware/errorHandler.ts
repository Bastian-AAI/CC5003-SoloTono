import type { ErrorRequestHandler, Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";
import logger from "../utils/logger.ts";
import { HttpError } from "../utils/errors.ts";

export const requestLogger: RequestHandler = (req, res, next) => {
  // No se registra el body: puede contener contraseñas.
  res.on("finish", () => logger.info(`${req.method} ${req.originalUrl} -> ${res.statusCode}`));
  next();
};

// 404 en JSON para cualquier ruta que no exista.
export const unknownEndpoint: RequestHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: "unknown endpoint" });
};

const hasProp = <K extends string>(value: unknown, key: K): value is Record<K, unknown> =>
  typeof value === "object" && value !== null && key in value;

// Todo error termina aquí y responde JSON { error, details? } con el código que corresponde.
export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message, ...(error.details ? { details: error.details } : {}) });
  } else if (error instanceof mongoose.Error.ValidationError) {
    const details: Record<string, string> = {};
    for (const [path, err] of Object.entries(error.errors)) details[path] = err.message;
    res.status(400).json({ error: "validation failed", details });
  } else if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ error: `malformatted value for '${error.path}'` });
  } else if (hasProp(error, "code") && error.code === 11000) {
    res.status(409).json({ error: "resource already exists (duplicate value)" });
  } else if (hasProp(error, "name") && (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError")) {
    res.status(401).json({ error: "invalid token" });
  } else if (hasProp(error, "type") && error.type === "entity.parse.failed") {
    res.status(400).json({ error: "malformed JSON body" });
  } else if (hasProp(error, "type") && error.type === "entity.too.large") {
    res.status(413).json({ error: "payload too large" });
  } else {
    logger.error(error);
    res.status(500).json({ error: "internal server error" });
  }
};
