"""
Backend SQLite. Implementa PrecioRepository.
"""

import sqlite3
import json
from datetime import datetime
from typing import Optional

from db.base import PrecioRepository
from models import Producto, PrecioSnapshot, CambioPrecio


SCHEMA = """
CREATE TABLE IF NOT EXISTS productos (
    product_id TEXT PRIMARY KEY,
    nombre TEXT,
    marca TEXT,
    sku TEXT,
    url_preferida TEXT,
    url_por_id TEXT,
    canonical TEXT,
    urls_alias TEXT,          -- JSON
    fecha_alta TEXT
);

CREATE TABLE IF NOT EXISTS precios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    precio REAL,
    precio_texto TEXT,
    stock TEXT,
    url_usada TEXT,
    url_final TEXT,
    timestamp TEXT NOT NULL,
    error TEXT,
    FOREIGN KEY (product_id) REFERENCES productos(product_id)
);

CREATE INDEX IF NOT EXISTS idx_precios_product_ts
    ON precios(product_id, timestamp DESC);
"""


class SQLiteRepository(PrecioRepository):

    def __init__(self, ruta_db: str = "precios.db"):
        self.ruta = ruta_db
        self.conn = sqlite3.connect(ruta_db)
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(SCHEMA)
        self.conn.commit()

    # ---------- Productos ----------
    def upsert_producto(self, p: Producto) -> None:
        self.conn.execute("""
            INSERT INTO productos
                (product_id, nombre, marca, sku, url_preferida,
                 url_por_id, canonical, urls_alias, fecha_alta)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(product_id) DO UPDATE SET
                nombre=excluded.nombre,
                marca=excluded.marca,
                sku=excluded.sku,
                url_preferida=excluded.url_preferida,
                url_por_id=excluded.url_por_id,
                canonical=excluded.canonical,
                urls_alias=excluded.urls_alias
        """, (
            p.product_id, p.nombre, p.marca, p.sku,
            p.url_preferida, p.url_por_id, p.canonical,
            json.dumps(p.urls_alias or [], ensure_ascii=False),
            p.fecha_alta or datetime.now().isoformat(),
        ))
        self.conn.commit()

    def obtener_producto(self, product_id: str) -> Optional[Producto]:
        row = self.conn.execute(
            "SELECT * FROM productos WHERE product_id = ?", (product_id,)
        ).fetchone()
        return self._row_a_producto(row) if row else None

    def listar_productos(self) -> list[Producto]:
        rows = self.conn.execute("SELECT * FROM productos").fetchall()
        return [self._row_a_producto(r) for r in rows]

    def _row_a_producto(self, row) -> Producto:
        return Producto(
            product_id=row["product_id"],
            nombre=row["nombre"],
            marca=row["marca"],
            sku=row["sku"],
            url_preferida=row["url_preferida"],
            url_por_id=row["url_por_id"],
            canonical=row["canonical"],
            urls_alias=json.loads(row["urls_alias"] or "[]"),
            fecha_alta=row["fecha_alta"],
        )

    # ---------- Snapshots ----------
    def guardar_snapshot(self, s: PrecioSnapshot) -> None:
        self.conn.execute("""
            INSERT INTO precios
                (product_id, precio, precio_texto, stock,
                 url_usada, url_final, timestamp, error)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s.product_id, s.precio, s.precio_texto, s.stock,
            s.url_usada, s.url_final,
            s.timestamp or datetime.now().isoformat(),
            s.error,
        ))
        self.conn.commit()

    def obtener_ultimo_snapshot(self, product_id: str) -> Optional[PrecioSnapshot]:
        row = self.conn.execute("""
            SELECT * FROM precios
            WHERE product_id = ? AND error IS NULL
            ORDER BY timestamp DESC
            LIMIT 1
        """, (product_id,)).fetchone()
        return self._row_a_snapshot(row) if row else None

    def obtener_historial(
        self, product_id: str, limite: int = 100
    ) -> list[PrecioSnapshot]:
        rows = self.conn.execute("""
            SELECT * FROM precios
            WHERE product_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        """, (product_id, limite)).fetchall()
        return [self._row_a_snapshot(r) for r in rows]

    def _row_a_snapshot(self, row) -> PrecioSnapshot:
        return PrecioSnapshot(
            product_id=row["product_id"],
            precio=row["precio"],
            precio_texto=row["precio_texto"],
            stock=row["stock"],
            url_usada=row["url_usada"],
            url_final=row["url_final"],
            timestamp=row["timestamp"],
            error=row["error"],
        )

    # ---------- Análisis ----------
    def detectar_cambio(self, product_id: str, precio_actual: float) -> CambioPrecio:
        ultimo = self.obtener_ultimo_snapshot(product_id)
        if not ultimo or ultimo.precio is None:
            return CambioPrecio(
                product_id=product_id,
                precio_anterior=None,
                precio_actual=precio_actual,
                cambio="nuevo",
            )
        anterior = ultimo.precio
        delta = precio_actual - anterior
        delta_pct = (delta / anterior * 100) if anterior else None

        if delta > 0:
            cambio = "subio"
        elif delta < 0:
            cambio = "bajo"
        else:
            cambio = "igual"

        return CambioPrecio(
            product_id=product_id,
            precio_anterior=anterior,
            precio_actual=precio_actual,
            cambio=cambio,
            delta=delta,
            delta_pct=delta_pct,
        )

    def cerrar(self) -> None:
        self.conn.close()