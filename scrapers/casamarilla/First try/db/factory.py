"""
Elige el backend según configuración.
El resto del código llama a `crear_repositorio()` y no sabe qué hay detrás.
"""

import config
from db.base import PrecioRepository


def crear_repositorio() -> PrecioRepository:
    backend = config.DB_BACKEND.lower()

    if backend == "sqlite":
        from db.sqlite_backend import SQLiteRepository
        return SQLiteRepository(config.SQLITE_PATH)

    if backend == "postgres":
        from db.postgres_backend import PostgresRepository
        return PostgresRepository(config.POSTGRES_DSN)

    raise ValueError(f"Backend no soportado: {backend}")