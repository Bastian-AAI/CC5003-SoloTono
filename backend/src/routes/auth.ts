import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { Router, type CookieOptions, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config.ts";
import { COOKIE_NAME, withUser } from "../middleware/auth.ts";
import User from "../models/User.ts";
import { badRequest, unauthorized } from "../utils/errors.ts";
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
  if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password) > 72) {
    throw badRequest("validation failed", { password: "La contraseña debe tener entre 8 y 72 caracteres" });
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await new User({ username, name, passwordHash }).save();
  res.status(201).json(user);
};

const router = Router();

router.post("/register", register);

router.post("/login", async (req, res) => {
  const { username, password } = pick(req.body, ["username", "password"]);
  if (typeof username !== "string" || typeof password !== "string") {
    throw badRequest("username and password are required");
  }

  const user = await User.findOne({ username: username.trim().toLowerCase() }).select("+passwordHash");
  const passwordCorrect = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordCorrect) {
    // Mismo mensaje para usuario inexistente y contraseña errónea.
    throw unauthorized("invalid username or password");
  }

  // El token CSRF aleatorio va DENTRO del JWT firmado y también se entrega al frontend por header.
  const userForToken = { username: user.username, csrf: randomUUID(), id: String(user._id) };
  const token = jwt.sign(userForToken, config.JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });

  res.setHeader("X-CSRF-Token", userForToken.csrf);
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: TOKEN_TTL_SECONDS * 1000 });
  // El body nunca incluye el JWT ni el hash.
  res.status(200).json({ id: String(user._id), username: user.username, name: user.name, role: user.role });
});

// Restaura la sesión al recargar la página.
router.get("/me", withUser, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw unauthorized("invalid token");
  res.json(user);
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
