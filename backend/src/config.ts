import "dotenv/config";

const isTest = process.env.NODE_ENV === "test";

// Las variables sensibles viven en .env (fuera del repo). Si falta alguna, la app
// no arranca: así nunca se usa un secreto "por defecto" inseguro.
const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa backend/.env (ver .env.example).`);
  }
  return value;
};

export const config = {
  PORT: Number(process.env.PORT ?? 3001),
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  MONGODB_URI: required(isTest ? "TEST_MONGODB_URI" : "MONGODB_URI"),
  MONGODB_DBNAME: (isTest ? process.env.TEST_MONGODB_DBNAME : process.env.MONGODB_DBNAME) ?? "solotono",
  JWT_SECRET: required("JWT_SECRET"),
};

export default config;
