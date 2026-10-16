import bcrypt from "bcrypt";
import { Router, type Request, type Response } from "express";
import { withUser } from "../middleware/auth.ts";
import { withAdmin } from "../middleware/roles.ts";
import UserModel, { ROLES, type Role } from "../models/User.ts";
import { badRequest, conflict, notFound } from "../utils/errors.ts";
import { pick } from "../utils/pick.ts";

const router = Router();

// Todas las rutas de gestión de usuarios requieren sesión de administrador
router.use(withUser, withAdmin);

// GET /api/users - Listar todos los usuarios
router.get("/", async (_req: Request, res: Response) => {
  const users = await UserModel.findAll();
  res.json(users);
});

// GET /api/users/:id - Obtener usuario por ID
router.get("/:id", async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    throw badRequest("ID de usuario inválido");
  }
  const user = await UserModel.findById(userId);
  if (!user) {
    throw notFound("Usuario no encontrado");
  }
  res.json(user);
});

// POST /api/users - Crear usuario desde panel de administración
router.post("/", async (req: Request, res: Response) => {
  const { username, name, password, role } = pick(req.body, ["username", "name", "password", "role"]);

  if (typeof username !== "string" || !/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
    throw badRequest("Nombre de usuario inválido (3-30 caracteres alfanuméricos)");
  }
  if (typeof password !== "string" || password.length < 8) {
    throw badRequest("La contraseña debe tener al menos 8 caracteres");
  }

  const cleanUsername = username.trim().toLowerCase();
  if (await UserModel.existsByUsername(cleanUsername)) {
    throw conflict("El nombre de usuario ya está en uso");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const validRole: Role =
    typeof role === "string" && (ROLES as readonly string[]).includes(role) ? (role as Role) : "user";

  const created = await UserModel.create({
    username: cleanUsername,
    name: typeof name === "string" && name.trim() ? name.trim() : cleanUsername,
    passwordHash,
    role: validRole,
  });
  res.status(201).json(created);
});

// PUT /api/users/:id - Actualizar rol o nombre de usuario
router.put("/:id", async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    throw badRequest("ID de usuario inválido");
  }

  const { username, name, role } = pick(req.body, ["username", "name", "role"]);
  if (role !== undefined && (typeof role !== "string" || !(ROLES as readonly string[]).includes(role))) {
    throw badRequest("Rol inválido. Valores permitidos: user, admin, moderator");
  }

  const updated = await UserModel.update(userId, {
    username: typeof username === "string" ? username : undefined,
    name: typeof name === "string" ? name : undefined,
    role: typeof role === "string" ? (role as Role) : undefined,
  });

  if (!updated) {
    throw notFound("Usuario no encontrado");
  }
  res.json(updated);
});

// DELETE /api/users/:id - Eliminar usuario por ID
router.delete("/:id", async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    throw badRequest("ID de usuario inválido");
  }

  const deleted = await UserModel.remove(userId);
  if (!deleted) {
    throw notFound("Usuario no encontrado");
  }
  res.json({ message: "Usuario eliminado correctamente", id: String(userId) });
});

export default router;
