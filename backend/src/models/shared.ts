import type { SchemaOptions } from "mongoose";

// Serialización común: expone `id` en vez de `_id`/`__v` y nunca filtra el hash de la contraseña.
export const toJSON: SchemaOptions["toJSON"] = {
  versionKey: false,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  },
};

export const schemaOptions = { timestamps: true, toJSON } satisfies SchemaOptions;

export const CATEGORIES = [
  "guitarras",
  "bajos",
  "teclados",
  "baterias",
  "viento",
  "amplificacion",
  "accesorios",
] as const;

export type Category = (typeof CATEGORIES)[number];
