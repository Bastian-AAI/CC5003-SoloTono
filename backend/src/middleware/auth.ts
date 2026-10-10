import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config.ts";
import { unauthorized } from "../utils/errors.ts";

export const COOKIE_NAME = "token";

const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

// Exige sesión válida:
//  1) cookie httpOnly con un JWT firmado y vigente  -> identifica al usuario
//  2) header X-CSRF-Token igual al claim `csrf` DENTRO del JWT -> protege de CSRF
export const withUser = (req: Request, _res: Response, next: NextFunction): void => {
  const token: unknown = req.cookies?.[COOKIE_NAME];
  if (typeof token !== "string" || token === "") {
    throw unauthorized("missing token");
  }

  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch {
    throw unauthorized("invalid token");
  }

  const csrfHeader = req.headers["x-csrf-token"];
  if (
    typeof decoded === "object" &&
    typeof decoded.id === "string" &&
    typeof decoded.csrf === "string" &&
    typeof csrfHeader === "string" &&
    safeEqual(decoded.csrf, csrfHeader)
  ) {
    req.userId = decoded.id;
    next();
  } else {
    throw unauthorized("invalid token");
  }
};

// Para rutas de LECTURA públicas: si hay una sesión válida (cookie + CSRF correcto) se
// identifica al usuario; si no la hay (o es inválida) la petición sigue como anónima.
// Nunca rechaza: sirve para que la página principal funcione sin login.
export const optionalUser = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    withUser(req, _res, () => undefined);
  } catch {
    req.userId = undefined;
  }
  next();
};
