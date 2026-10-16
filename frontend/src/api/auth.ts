import axios from "axios";
import type { Credentials, RegisterData, User } from "../types";
import axiosSecure, { CSRF_KEY } from "../utils/axiosSecure";

export const USER_STORAGE_KEY = "solotono_user";

// Cliente para login/registro/logout con withCredentials para recibir y enviar la cookie httpOnly.
const plain = axios.create({
  withCredentials: true,
});

const persistSessionMetadata = (user: User, csrfToken: unknown) => {
  if (typeof csrfToken === "string") {
    localStorage.setItem(CSRF_KEY, csrfToken);
  }
  localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify({ id: user.id, username: user.username, name: user.name, role: user.role }),
  );
};

export const login = async (credentials: Credentials): Promise<User> => {
  const response = await plain.post<User>("/api/auth/login", credentials);
  persistSessionMetadata(response.data, response.headers["x-csrf-token"]);
  return response.data;
};

export const register = async (data: RegisterData): Promise<User> => {
  const response = await plain.post<User>("/api/auth/register", data);
  persistSessionMetadata(response.data, response.headers["x-csrf-token"]);
  return response.data;
};

// Restaura la sesión al cargar la app. null = no hay sesión.
export const restoreLogin = async (): Promise<User | null> => {
  if (!localStorage.getItem(CSRF_KEY)) return null;
  try {
    const response = await axiosSecure.get<User>("/api/auth/me");
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
    return response.data;
  } catch {
    localStorage.removeItem(CSRF_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await plain.post("/api/auth/logout");
  } finally {
    localStorage.removeItem(CSRF_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};
