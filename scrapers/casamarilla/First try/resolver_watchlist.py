"""
Resuelve una lista de URLs de producto de Casa Amarilla (formatos mezclados)
y genera una watchlist deduplicada por product_id.

Estrategia:
  1. Si la URL ya trae product_id en el query string, lo usa directo.
  2. Si no, visita la URL para extraer product_id del HTML.
  3. Con el product_id, consulta el endpoint JSON para enriquecer los datos.

Uso:
    1. Edita URLS_ENTRADA con tus URLs.
    2. python resolver_watchlist.py
    3. Se generan: watchlist.json y resolucion_detalle.json
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import random
import re
from datetime import datetime
from urllib.parse import urlparse, parse_qs

# ============================================================
# CONFIGURACIÓN
# ============================================================
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,"
              "image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
}

DOMINIO = "https://casamarilla.cl"
JSON_ENDPOINT = f"{DOMINIO}/_ca_product.php"
PAUSA_MIN = 2.0
PAUSA_MAX = 4.0

# ---------- Sesión reutilizable ----------
_session: requests.Session | None = None


def _get_session() -> requests.Session:
    """Inicializa la sesión una sola vez (lazy)."""
    global _session
    if _session is None:
        _session = requests.Session()
        _session.headers.update(HEADERS)
    return _session

# ============================================================
# INPUT: tus URLs mezcladas
# ============================================================
URLS_ENTRADA = [
    "https://casamarilla.cl/037-8501-569",
    "https://casamarilla.cl/index.php?route=product/product&product_id=22678",
    "https://casamarilla.cl/ACTION-JUNIOR-OPBC",
    "https://casamarilla.cl/XS1",
    # Añade aquí todas las que quieras
]

# ============================================================
# UTILIDADES
# ============================================================
def limpiar_precio(texto):
    if not texto:
        return None
    limpio = re.sub(r"[^\d]", "", texto)
    return float(limpio) if limpio else None


def extraer_product_id_de_url(url):
    """Si la URL ya tiene product_id en el query string, lo extrae."""
    try:
        parsed = urlparse(url)
        qs = parse_qs(parsed.query)
        if "product_id" in qs:
            return qs["product_id"][0]
    except Exception:
        pass
    return None


def normalizar_url(url):
    """Asegura que la URL tenga esquema y dominio correcto."""
    if not url.startswith("http"):
        return f"{DOMINIO}/{url.lstrip('/')}"
    return url


# ============================================================
# CONSULTA AL ENDPOINT JSON
# ============================================================
def consultar_json(product_id: str) -> dict | None:
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
# RESOLUCIÓN DE UNA URL
# ============================================================
def resolver_url(url):
    """
    Dada cualquier URL de producto, devuelve un dict con:
    product_id, canonical, sku, nombre, precio, stock, url_final...

    Estrategia:
      1. Si la URL tiene product_id en query string → lo usa directo.
      2. Si no, visita la URL HTML para extraer product_id.
      3. Con el product_id, consulta el endpoint JSON para datos ricos.
      4. Fallback HTML si el JSON no funciona.
    """
    url = normalizar_url(url)
    resultado = {
        "url_original": url,
        "url_final": None,
        "canonical": None,
        "product_id": None,
        "sku": None,
        "nombre": None,
        "marca": None,
        "precio_texto": None,
        "precio": None,
        "stock": None,
        "error": None,
    }

    session = _get_session()

    # --- Paso 1: Obtener product_id ---
    product_id = extraer_product_id_de_url(url)

    if not product_id:
        # Necesitamos visitar la URL para extraer product_id del HTML
        try:
            resp = session.get(url, timeout=30, allow_redirects=True)
        except requests.RequestException as e:
            resultado["error"] = f"request: {e}"
            return resultado

        resultado["url_final"] = resp.url

        if resp.status_code == 403:
            resultado["error"] = "403 Forbidden (bloqueo)"
            return resultado
        if resp.status_code != 200:
            resultado["error"] = f"HTTP {resp.status_code}"
            return resultado

        soup = BeautifulSoup(resp.text, "html.parser")

        # Buscar product_id: input hidden > query string de url_final
        inp = soup.select_one("input[name='product_id']")
        if inp:
            product_id = inp.get("value")

        if not product_id:
            product_id = extraer_product_id_de_url(resp.url)

        # Canonical del HTML
        canonical_el = soup.select_one("link[rel='canonical']")
        if canonical_el:
            resultado["canonical"] = canonical_el.get("href")

        if not product_id:
            resultado["error"] = "no se pudo extraer product_id"
            return resultado

    resultado["product_id"] = product_id

    # --- Paso 2: Consultar endpoint JSON para datos ricos ---
    data = consultar_json(product_id)

    if data:
        resultado["sku"] = data.get("sku")
        resultado["nombre"] = data.get("title")
        resultado["marca"] = data.get("brand")

        precio = data.get("price_now")
        if precio is not None:
            resultado["precio"] = precio
            resultado["precio_texto"] = f"${precio:,.0f}".replace(",", ".")

        stock_data = data.get("stock", {})
        if isinstance(stock_data, dict):
            qty = stock_data.get("quantity")
            in_stock = stock_data.get("in_stock")
            if in_stock is not None:
                resultado["stock"] = (
                    f"{'En stock' if in_stock else 'Sin stock'} ({qty})"
                    if qty is not None
                    else ("En stock" if in_stock else "Sin stock")
                )

        if not resultado["canonical"]:
            resultado["canonical"] = data.get("canonical")

        if not resultado["url_final"]:
            resultado["url_final"] = (
                f"{DOMINIO}/index.php?route=product/product"
                f"&product_id={product_id}"
            )
    else:
        # Fallback: datos del HTML si el JSON falló
        # (ya tenemos soup si hicimos el request HTML)
        resultado["error"] = "endpoint JSON no disponible (fallback parcial)"

    return resultado


# ============================================================
# RESOLUCIÓN DE LOTE + DEDUPLICACIÓN
# ============================================================
def resolver_lote(urls):
    """Resuelve todas las URLs con pausas respetuosas."""
    resultados = []
    total = len(urls)
    for i, url in enumerate(urls, 1):
        print(f"[{i}/{total}] 🔍 {url}")
        r = resolver_url(url)
        if r["error"]:
            print(f"        ❌ {r['error']}")
        else:
            print(f"        ✅ product_id={r['product_id']}  "
                  f"nombre={r['nombre'][:60] if r['nombre'] else '?'}")
        resultados.append(r)
        if i < total:
            time.sleep(random.uniform(PAUSA_MIN, PAUSA_MAX))
    return resultados


def deduplicar_por_product_id(resultados):
    """
    Agrupa resultados por product_id.
    Devuelve:
      - watchlist: un registro por product_id (el primero encontrado)
      - alias: mapa product_id -> [urls alternativas]
    """
    por_id = {}
    alias = {}
    sin_id = []

    for r in resultados:
        if r["error"]:
            continue
        pid = r["product_id"]
        if not pid:
            sin_id.append(r)
            continue

        alias.setdefault(pid, []).append(r["url_original"])

        if pid not in por_id:
            # Registro base: preferimos canonical si existe
            base = dict(r)
            if base.get("canonical"):
                base["url_preferida"] = base["canonical"]
            else:
                base["url_preferida"] = base["url_original"]
            # URL canónica construida por product_id (la más estable)
            base["url_por_id"] = (
                f"{DOMINIO}/index.php?route=product/product&product_id={pid}"
            )
            por_id[pid] = base

    return list(por_id.values()), alias, sin_id


def construir_watchlist(por_id, alias):
    """Watchlist final limpia y lista para el scraper de precios."""
    watchlist = []
    for item in por_id:
        pid = item["product_id"]
        watchlist.append({
            "product_id": pid,
            "nombre": item.get("nombre"),
            "marca": item.get("marca"),
            "sku": item.get("sku"),
            "url_preferida": item.get("url_preferida"),
            "url_por_id": item.get("url_por_id"),
            "canonical": item.get("canonical"),
            "urls_alias": alias.get(pid, []),
            "precio_texto_inicial": item.get("precio_texto"),
            "precio_inicial": item.get("precio"),
            "stock_inicial": item.get("stock"),
            "fecha_resolucion": datetime.now().isoformat(),
        })
    # Ordenar por product_id numérico si se puede
    watchlist.sort(key=lambda x: int(x["product_id"]) if str(x["product_id"]).isdigit() else 0)
    return watchlist


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 60)
    print("RESOLUCIÓN DE URLs → WATCHLIST (Casa Amarilla)")
    print("=" * 60)

    # 1. Resolver
    resultados = resolver_lote(URLS_ENTRADA)

    # 2. Deduplicar
    por_id, alias, sin_id = deduplicar_por_product_id(resultados)

    # 3. Construir watchlist
    watchlist = construir_watchlist(por_id, alias)

    # 4. Guardar
    with open("watchlist.json", "w", encoding="utf-8") as f:
        json.dump(watchlist, f, ensure_ascii=False, indent=2)

    with open("resolucion_detalle.json", "w", encoding="utf-8") as f:
        json.dump({
            "resultados": resultados,
            "alias": alias,
            "sin_product_id": sin_id,
        }, f, ensure_ascii=False, indent=2)

    # 5. Reporte
    print()
    print("=" * 60)
    print("📊 REPORTE")
    print("=" * 60)
    print(f"URLs de entrada:         {len(URLS_ENTRADA)}")
    print(f"URLs resueltas OK:       {sum(1 for r in resultados if not r['error'])}")
    print(f"URLs con error:          {sum(1 for r in resultados if r['error'])}")
    print(f"Productos únicos:        {len(watchlist)}")
    print(f"URLs sin product_id:     {len(sin_id)}")
    print()

    if len(watchlist) < sum(1 for r in resultados if not r["error"]):
        print("💡 Nota: había URLs duplicadas (mismo producto, distinto formato).")
        print("   Se colapsaron en un solo registro por product_id.")
        print()

    print("📁 Archivos generados:")
    print("   - watchlist.json          (para el scraper de precios)")
    print("   - resolucion_detalle.json (detalle completo + alias)")
    print()

    # 6. Mostrar watchlist
    print("🎯 WATCHLIST:")
    for item in watchlist:
        print(f"   [{item['product_id']}] {item['nombre']}")
        print(f"        url_por_id: {item['url_por_id']}")
        if len(item["urls_alias"]) > 1:
            print(f"        alias: {item['urls_alias']}")
        print()


if __name__ == "__main__":
    main()