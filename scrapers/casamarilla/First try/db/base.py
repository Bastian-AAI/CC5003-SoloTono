"""
Interfaz abstracta del repositorio.
Cualquier backend (SQLite, Postgres, MySQL, Mongo...) debe implementar esto.
El scraper SOLO conoce esta interfaz.
"""

from abc import ABC, abstractmethod
from typing import Optional
from models import Producto, PrecioSnapshot, CambioPrecio


class PrecioRepository(ABC):
    """Contrato que todo backend debe cumplir."""

    # ---------- Productos ----------
    @abstractmethod
    def upsert_producto(self, producto: Producto) -> None:
        """Inserta o actualiza un producto."""
        ...

    @abstractmethod
    def obtener_producto(self, product_id: str) -> Optional[Producto]:
        ...

    @abstractmethod
    def listar_productos(self) -> list[Producto]:
        ...

    # ---------- Snapshots de precio ----------
    @abstractmethod
    def guardar_snapshot(self, snap: PrecioSnapshot) -> None:
        """Guarda una medición de precio."""
        ...

    @abstractmethod
    def obtener_ultimo_snapshot(self, product_id: str) -> Optional[PrecioSnapshot]:
        """Último snapshot válido (sin error) de un producto."""
        ...

    @abstractmethod
    def obtener_historial(
        self, product_id: str, limite: int = 100
    ) -> list[PrecioSnapshot]:
        ...

    # ---------- Análisis ----------
    @abstractmethod
    def detectar_cambio(self, product_id: str, precio_actual: float) -> CambioPrecio:
        """Compara precio_actual con el último guardado."""
        ...

    # ---------- Utilidades ----------
    @abstractmethod
    def cerrar(self) -> None:
        ...