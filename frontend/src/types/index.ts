export type Role = "user" | "admin" | "moderator";

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface RegisterData extends Credentials {
  name: string;
}

/** Forma de los errores JSON del backend. */
export interface ApiErrorBody {
  error?: string;
  details?: Record<string, string>;
}