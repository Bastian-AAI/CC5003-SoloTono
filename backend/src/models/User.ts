import mongoose, { Schema } from "mongoose";
import { schemaOptions } from "./shared.ts";

export const ROLES = ["user", "moderator"] as const;
export type Role = (typeof ROLES)[number];

export interface IUser {
  username: string;
  name: string;
  email?: string;
  passwordHash: string;
  role: Role;
  favorites: mongoose.Types.ObjectId[];
  preferredCategories: string[];
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
    email: { type: String, trim: true, lowercase: true, sparse: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "user" },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    preferredCategories: [{ type: String }],
  },
  schemaOptions,
);

export default mongoose.model<IUser>("User", userSchema);