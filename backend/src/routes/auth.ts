import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { Router, type CookieOptions, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config.ts";
import { COOKIE_NAME, withUser } from "../middleware/auth.ts";
import UserModel from "../models/User.ts";
import { badRequest, conflict, unauthorized } from "../utils/errors.ts";
import { pick } from "../utils/pick.ts";

const SALT_ROUNDS = 10;
const TOKEN_TTL_SECONDS = 60 * 60; // 1 hora

// Opciones de la cookie con el JWT:
//  httpOnly -> JavaScript del navegador no puede leerla (mitiga robo de token por XSS)
//  secure   -> solo viaja por HTTPS en producción
//  sameSite -> el navegador no la adjunta en peticiones originadas en otros sitios (capa extra anti-CSRF)
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.IS_PRODUCTION,
  sameSite: "strict",
};

// Hash falso para gastar el mismo tiempo cuando el usuario no existe (evita enumerar usuarios por tiempos).
const DUMMY_HASH = bcrypt.hashSync("dummy-password", SALT_ROUNDS);

export const register = async (req: Request, res: Response) => {
  const { username, name, password } = pick(req.body, ["username", "name", "password"]);

  if (typeof username !== "string" || !/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
    throw badRequest("El nombre de usuario debe tener entre 3 y 30 caracteres alfanuméricos, punto, guion o guion bajo");
  }

  if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password) > 72) {
    throw badRequest("validation failed", { password: "La contraseña debe tener entre 8 y 72 caracteres" });
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanName = typeof name === "string" && name.trim() ? name.trim().slice(0, 60) : cleanUsername;

  if (await UserModel.existsByUsername(cleanUsername)) {
    throw conflict("El nombre de usuario ya está en uso");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await UserModel.create({
    username: cleanUsername,
    name: cleanName,
    passwordHash,
    role: "user",
  });

  const userForToken = { username: newUser.username, csrf: randomUUID(), id: newUser.id };
  const token = jwt.sign(userForToken, config.JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });

  res.setHeader("X-CSRF-Token", userForToken.csrf);
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: TOKEN_TTL_SECONDS * 1000 });
  res.status(201).json(newUser);
};

const router = Router();

router.post("/register", register);

router.post("/login", async (req, res) => {
  const { username, password } = pick(req.body, ["username", "password"]);
  if (typeof username !== "string" || typeof password !== "string") {
    throw badRequest("username and password are required");
  }

  const cleanUsername = username.trim().toLowerCase();
  const user = await UserModel.findByUsernameWithHash(cleanUsername);

  const passwordCorrect = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordCorrect) {
    throw unauthorized("invalid username or password");
  }

  // El token CSRF aleatorio va DENTRO del JWT firmado y también se entrega al frontend por header.
  const userForToken = { username: user.username, csrf: randomUUID(), id: user.id };
  const token = jwt.sign(userForToken, config.JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });

  res.setHeader("X-CSRF-Token", userForToken.csrf);
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: TOKEN_TTL_SECONDS * 1000 });
  res.status(200).json({ id: user.id, username: user.username, name: user.name, role: user.role });
});

// Restaura la sesión al recargar la página.
router.get("/me", withUser, async (req, res) => {
  const user = await UserModel.findById(Number(req.userId));
  if (!user) throw unauthorized("invalid token");
  res.json(user);
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
