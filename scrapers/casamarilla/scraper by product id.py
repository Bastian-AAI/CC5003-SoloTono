def url_desde_product_id(product_id):
    return (f"https://casamarilla.cl/index.php"
            f"?route=product/product&product_id={product_id}")

def scrapear_precio(product_id):
    url = url_desde_product_id(product_id)
    resp = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    pdp = soup.select_one("section.ca-pdp")
    if not pdp:
        return {"error": "no es producto", "product_id": product_id}

    def txt(sel):
        el = soup.select_one(sel)
        return el.get_text(strip=True) if el else None

    precio_texto = txt(".ca-pdp__price-now")
    return {
        "product_id": product_id,
        "url_usada": url,
        "url_final": resp.url,
        "nombre": txt(".ca-pdp__title"),
        "precio_texto": precio_texto,
        "precio": limpiar_precio(precio_texto),
        "stock": txt(".ca-pdp__stock-badge"),
        "timestamp": datetime.now().isoformat(),
    }

def main():
    with open("watchlist.json", "r", encoding="utf-8") as f:
        watchlist = json.load(f)

    for item in watchlist:
        pid = item["product_id"]
        print(f"🔍 product_id={pid} ({item.get('nombre')})")
        datos = scrapear_precio(pid)
        print(f"   {datos.get('precio_texto')} · {datos.get('stock')}")
        with open("historico_precios.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(datos, ensure_ascii=False) + "\n")
        time.sleep(random.uniform(2, 4))