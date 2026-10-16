import "dotenv/config";

// Las variables sensibles viven en .env (fuera del repo). Si falta alguna, la app
// no arranca: así nunca se usa un secreto "por defecto" inseguro.
const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa backend/.env (ver .env.example).`);
  }
  return value;
};

export const config = {
  PORT: Number(process.env.PORT ?? 3001),
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  DATABASE_URL: required("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/solotono"),
  JWT_SECRET: required("JWT_SECRET", "supersecretjwtkey_cc5003_solotono_dev_2026"),
};

export default config;
