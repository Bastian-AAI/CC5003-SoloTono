"""
Scraper puro. No sabe nada de bases de datos.
Solo recibe un product_id y devuelve un PrecioSnapshot.

Estrategia:
  1. Fuente primaria: endpoint JSON /_ca_product.php?product_id=X
     → Rápido, confiable, datos limpios (int, no necesita parsear "$199.000").
  2. Fallback HTML: si el JSON falla, visita la URL del producto,
     extrae product_id del HTML y lo reintenta por JSON.
"""

import re
import requests
from datetime import datetime
from typing import Optional

import config
from models import PrecioSnapshot

# ---------- Sesión reutilizable ----------
# Reutiliza conexiones TCP y mantiene cookies entre requests,
# comportándose más como un navegador real.
_session: requests.Session | None = None

DOMINIO = "https://casamarilla.cl"
JSON_ENDPOINT = f"{DOMINIO}/_ca_product.php"


def _get_session() -> requests.Session:
    """Inicializa la sesión una sola vez (lazy)."""
    global _session
    if _session is None:
        _session = requests.Session()
        _session.headers.update(config.HEADERS)
    return _session


def limpiar_precio(texto: str) -> float | None:
    """Extrae un número de un string como '$199.000' → 199000.0"""
    if not texto:
        return None
    limpio = re.sub(r"[^\d]", "", texto)
    return float(limpio) if limpio else None


# ============================================================
# FUENTE PRIMARIA: JSON endpoint
# ============================================================
def _scrapear_json(product_id: str) -> dict | None:
    """
    Consulta /_ca_product.php?product_id=X
    Devuelve el dict crudo del JSON o None si falla.
    """
    session = _get_session()
    try:
        resp = session.get(
            JSON_ENDPOINT,
            params={"product_id": product_id},
            timeout=30,
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        if not data.get("ok"):
            return None
        return data
    except (requests.RequestException, ValueError):
        return None


# ============================================================
# FALLBACK: HTML (solo para extraer product_id si no lo tenemos)
# ============================================================
def _extraer_product_id_html(url: str) -> Optional[str]:
    """
    Visita la URL del producto y extrae el product_id del HTML.
    Útil cuando solo tenemos un slug (ej: /ACTION-JUNIOR-OPBC).
    """
    session = _get_session()
    try:
        resp = session.get(url, timeout=30, allow_redirects=True)
        if resp.status_code != 200:
            return None
    except requests.RequestException:
        return None

    from bs4 import BeautifulSoup
    soup = BeautifulSoup(resp.text, "html.parser")

    # Buscar input hidden con product_id
    inp = soup.select_one("input[name='product_id']")
    if inp:
        return inp.get("value")

    # Fallback: query string de la URL final
    from urllib.parse import urlparse, parse_qs
    qs = parse_qs(urlparse(resp.url).query)
    if "product_id" in qs:
        return qs["product_id"][0]

    return None


# ============================================================
# FUNCIÓN PRINCIPAL
# ============================================================
def scrapear(product_id: str, url: str) -> PrecioSnapshot:
    """
    Scrapea un producto y devuelve un PrecioSnapshot.

    Estrategia:
      1. Intenta el endpoint JSON con product_id.
      2. Si falla, visita la URL HTML para extraer product_id y reintenta JSON.
      3. Si todo falla, registra el error.
    """
    snap = PrecioSnapshot(
        product_id=product_id,
        url_usada=url,
        timestamp=datetime.now().isoformat(),
    )

    # --- 1. Intentar endpoint JSON ---
    data = _scrapear_json(product_id)

    # --- 2. Fallback HTML → JSON ---
    if data is None and url:
        pid_html = _extraer_product_id_html(url)
        if pid_html and pid_html != product_id:
            # El product_id que teníamos era incorrecto o cambió
            snap.product_id = pid_html
            data = _scrapear_json(pid_html)
        elif pid_html:
            # Mismo product_id pero el JSON no devolvió datos
            data = None

    # --- 3. Procesar resultado ---
    if data is None:
        snap.error = "sin datos (JSON y HTML fallaron)"
        return snap

    snap.url_final = f"{DOMINIO}/index.php?route=product/product&product_id={data['product_id']}"

    # Precio: ya viene como int/float, no necesita limpiar_precio()
    snap.precio = data.get("price_now")
    if snap.precio is not None:
        snap.precio_texto = f"${snap.precio:,.0f}".replace(",", ".")

    # Stock
    stock_data = data.get("stock", {})
    if isinstance(stock_data, dict):
        qty = stock_data.get("quantity")
        in_stock = stock_data.get("in_stock")
        if in_stock is not None:
            snap.stock = f"{'En stock' if in_stock else 'Sin stock'} ({qty})" if qty is not None else (
                "En stock" if in_stock else "Sin stock"
            )
    elif stock_data:
        snap.stock = str(stock_data)

    return snap