import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "./config.ts";
import { ensureSchema, query } from "./db.ts";
import authRouter from "./routes/auth.ts";
import productsRouter from "./routes/products.ts";
import storesRouter from "./routes/stores.ts";
import categoriesRouter from "./routes/categories.ts";
import offersRouter from "./routes/offers.ts";
import favoritesRouter from "./routes/favorites.ts";
import usersRouter from "./routes/users.ts";
import { errorHandler, requestLogger, unknownEndpoint } from "./middleware/errorHandler.ts";
import logger from "./utils/logger.ts";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = config.PORT || 3001;

// CORS con credenciales para intercambio de cookies httpOnly y header CSRF
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    exposedHeaders: ["x-csrf-token", "X-CSRF-Token"],
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(requestLogger);
app.use(express.static(path.resolve(__dirname, "../../frontend/public")));

// Garantizar que las tablas de PostgreSQL existan antes de procesar peticiones API
app.use("/api", async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await ensureSchema();
    next();
  } catch (err) {
    next(err);
  }
});

// GET /api/health - Estado del servidor y conexión a PostgreSQL
app.get("/api/health", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const dbRes = await query<{ now: string }>("SELECT NOW() as now");
    res.json({
      status: "ok",
      message: "CC5003-SoloTono API is up and running!",
      database: "connected",
      dbTime: dbRes.rows[0]?.now,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// Rutas REST por entidad (cada una expone GET /, GET /:id, POST /, PUT /:id, DELETE /:id)
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/stores", storesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/offers", offersRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/users", usersRouter);

// Manejo de rutas desconocidas y errores consistentes en JSON
app.use(unknownEndpoint);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  ensureSchema()
    .then(() => {
      app.listen(PORT, () => {
        logger.info(`Servidor CC5003-SoloTono corriendo en http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      logger.error("Error inicializando base de datos PostgreSQL:", err);
      process.exit(1);
    });
}

export default app;
