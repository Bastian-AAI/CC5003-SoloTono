"""
Modelos de datos. Independientes del backend de DB.
Usamos dataclasses para que sean ligeros y serializables.
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional


@dataclass
class Producto:
    """Producto que estamos trackeando."""
    product_id: str
    nombre: Optional[str] = None
    marca: Optional[str] = None
    sku: Optional[str] = None
    url_preferida: Optional[str] = None
    url_por_id: Optional[str] = None
    canonical: Optional[str] = None
    urls_alias: list = field(default_factory=list)
    fecha_alta: Optional[str] = None

    def to_dict(self):
        return asdict(self)


@dataclass
class PrecioSnapshot:
    """Una medición de precio en un momento dado."""
    product_id: str
    precio: Optional[float] = None
    precio_texto: Optional[str] = None
    stock: Optional[str] = None
    url_usada: Optional[str] = None
    url_final: Optional[str] = None
    timestamp: Optional[str] = None
    error: Optional[str] = None

    def to_dict(self):
        return asdict(self)


@dataclass
class CambioPrecio:
    """Resultado de comparar el precio actual con el anterior."""
    product_id: str
    precio_anterior: Optional[float]
    precio_actual: Optional[float]
    cambio: str  # "nuevo", "subio", "bajo", "igual", "sin_datos"
    delta: Optional[float] = None
    delta_pct: Optional[float] = None

    def to_dict(self):
        return asdict(self)