import mongoose, { Schema } from "mongoose";
import { schemaOptions } from "./shared.ts";

export const ROLES = ["user", "moderator"] as const;
export type Role = (typeof ROLES)[number];

export interface IUser {
  username: string;
  name: string;
  passwordHash: string;
  role: Role;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "El nombre de usuario es obligatorio"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "El usuario debe tener al menos 3 caracteres"],
      maxlength: [30, "El usuario puede tener como máximo 30 caracteres"],
      match: [/^[a-z0-9_.-]+$/, "El usuario solo admite letras, números, punto, guion y guion bajo"],
    },
    name: { type: String, trim: true, maxlength: [60, "El nombre puede tener como máximo 60 caracteres"], default: "" },
    // select:false -> nunca sale en las consultas a menos que se pida explícitamente (login).
    passwordHash: { type: String, required: true, select: false },
    // El rol NUNCA se acepta desde el cliente (registro/edición lo ignoran). Se asigna con `npm run make-moderator`.
    role: { type: String, enum: ROLES, default: "user" },
  },
  schemaOptions,
);

export default mongoose.model<IUser>("User", userSchema);
