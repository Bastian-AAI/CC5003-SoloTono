import requests
from bs4 import BeautifulSoup
import json
import time
import random

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
    "Upgrade-Insecure-Requests": "1",
}

def resolver_product_id(url):
    """
    Dada cualquier URL de producto (slug o product_id),
    devuelve el product_id interno y el canonical.
    """
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
        if resp.status_code != 200:
            return {"error": f"HTTP {resp.status_code}", "url": url}
    except requests.RequestException as e:
        return {"error": str(e), "url": url}

    soup = BeautifulSoup(resp.text, "html.parser")
    pdp = soup.select_one("section.ca-pdp")
    if not pdp:
        return {"error": "no es página de producto", "url": url}

    canonical_el = soup.select_one("link[rel='canonical']")
    canonical = canonical_el.get("href") if canonical_el else None

    # Fallbacks para product_id
    product_id = pdp.get("data-product-id")
    if not product_id:
        inp = soup.select_one("input[name='product_id']")
        if inp:
            product_id = inp.get("value")

    return {
        "url_original": url,
        "url_final": resp.url,
        "canonical": canonical,
        "product_id": product_id,
        "sku": pdp.get("data-sku"),
        "nombre": (soup.select_one(".ca-pdp__title") or {}).get_text(strip=True)
                  if soup.select_one(".ca-pdp__title") else None,
    }


def resolver_lote(urls):
    """Resuelve un lote de URLs y devuelve la watchlist enriquecida."""
    resultados = []
    for url in urls:
        print(f"🔍 Resolviendo {url}")
        r = resolver_product_id(url)
        if "error" in r:
            print(f"   ❌ {r['error']}")
        else:
            print(f"   ✅ product_id={r['product_id']}  canonical={r['canonical']}")
        resultados.append(r)
        time.sleep(random.uniform(2, 4))
    return resultados


if __name__ == "__main__":
    # Tus 4 URLs de ejemplo (distintos productos)
    urls = [
        "https://casamarilla.cl/037-8501-569",
        "https://casamarilla.cl/index.php?route=product/product&product_id=22678",
        "https://casamarilla.cl/ACTION-JUNIOR-OPBC",
        "https://casamarilla.cl/XS1",
    ]
    resultados = resolver_lote(urls)

    # Guardar watchlist enriquecida
    with open("watchlist.json", "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)
    print("💾 watchlist.json creado")