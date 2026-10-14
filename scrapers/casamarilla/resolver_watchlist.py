"""
Resuelve una lista de URLs de producto de Casa Amarilla (formatos mezclados)
y genera una watchlist deduplicada por product_id.

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
PAUSA_MIN = 2.0
PAUSA_MAX = 4.0

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
# RESOLUCIÓN DE UNA URL
# ============================================================
def resolver_url(url):
    """
    Dada cualquier URL de producto, devuelve un dict con:
    product_id, canonical, sku, nombre, precio, stock, url_final...
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

    try:
        resp = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
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

    # ¿Es página de producto?
    pdp = soup.select_one("section.ca-pdp")
    if not pdp:
        resultado["error"] = "no es página de producto"
        return resultado

    # product_id: prioridad data-product-id > input hidden > query string
    product_id = pdp.get("data-product-id")
    if not product_id:
        inp = soup.select_one("input[name='product_id']")
        if inp:
            product_id = inp.get("value")
    if not product_id:
        product_id = extraer_product_id_de_url(url)
    resultado["product_id"] = product_id

    # sku
    resultado["sku"] = pdp.get("data-sku")

    # canonical
    canonical_el = soup.select_one("link[rel='canonical']")
    if canonical_el:
        resultado["canonical"] = canonical_el.get("href")

    # nombre
    el = soup.select_one(".ca-pdp__title")
    if el:
        resultado["nombre"] = el.get_text(strip=True)

    # marca
    el = soup.select_one(".ca-pdp__brand")
    if el:
        resultado["marca"] = el.get_text(strip=True)

    # precio
    el = soup.select_one(".ca-pdp__price-now")
    if el:
        resultado["precio_texto"] = el.get_text(strip=True)
        resultado["precio"] = limpiar_precio(resultado["precio_texto"])

    # stock
    el = soup.select_one(".ca-pdp__stock-badge")
    if el:
        resultado["stock"] = el.get_text(strip=True)

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