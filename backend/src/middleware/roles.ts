import type { NextFunction, Request, Response } from "express";
import User from "../models/User.ts";
import { forbidden } from "../utils/errors.ts";

// El rol se consulta en la base de datos en cada petición (no viaja en el JWT):
// así, quitar o dar el rol de moderador surte efecto de inmediato.
export const isModerator = async (userId: string | undefined): Promise<boolean> =>
  userId !== undefined && (await User.exists({ _id: userId, role: "moderator" })) !== null;

// Usar SIEMPRE después de withUser.
export const withModerator = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  if (!(await isModerator(req.userId))) {
    throw forbidden("moderator role required");
  }
  next();
};
