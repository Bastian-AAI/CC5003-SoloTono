"""
Stub de implementación PostgreSQL.
Cuando quieras migrar, solo completas esto y cambias config.DB_BACKEND.
"""

from db.base import PrecioRepository
from models import Producto, PrecioSnapshot, CambioPrecio


class PostgresRepository(PrecioRepository):
    def __init__(self, dsn: str):
        # import psycopg2
        # self.conn = psycopg2.connect(dsn)
        raise NotImplementedError("Implementar cuando escale a Postgres")

    def upsert_producto(self, producto: Producto) -> None:
        raise NotImplementedError

    def obtener_producto(self, product_id: str):
        raise NotImplementedError

    def listar_productos(self):
        raise NotImplementedError

    def guardar_snapshot(self, snap: PrecioSnapshot) -> None:
        raise NotImplementedError

    def obtener_ultimo_snapshot(self, product_id: str):
        raise NotImplementedError

    def obtener_historial(self, product_id: str, limite: int = 100):
        raise NotImplementedError

    def detectar_cambio(self, product_id: str, precio_actual: float):
        raise NotImplementedError

    def cerrar(self) -> None:
        raise NotImplementedError