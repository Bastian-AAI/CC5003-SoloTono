import type { NextFunction, Request, Response } from "express";
import UserModel from "../models/User.ts";
import { forbidden } from "../utils/errors.ts";

// El rol se consulta en PostgreSQL en cada petición para aplicar cambios de privilegios de inmediato.
export const isAdmin = async (userId: string | undefined): Promise<boolean> => {
  if (!userId) return false;
  const numericId = Number(userId);
  if (isNaN(numericId)) return false;
  return UserModel.isAdminOrModerator(numericId);
};

export const isModerator = isAdmin;

// Usar SIEMPRE después de withUser.
export const withAdmin = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  if (!(await isAdmin(req.userId))) {
    throw forbidden("Se requiere rol de administrador para realizar esta acción");
  }
  next();
};

export const withModerator = withAdmin;
