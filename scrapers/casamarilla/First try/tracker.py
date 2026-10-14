"""
Orquestador: lee watchlist → scrapea → guarda en DB → detecta cambios.
Este es el script que corres con cron.
"""

import json
import time
import random
from datetime import datetime

import config
from db import crear_repositorio
from models import Producto, CambioPrecio
from scraper import scrapear


def cargar_watchlist(path: str) -> list[Producto]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [Producto(
        product_id=str(item["product_id"]),
        nombre=item.get("nombre"),
        marca=item.get("marca"),
        sku=item.get("sku"),
        url_preferida=item.get("url_preferida"),
        url_por_id=item.get("url_por_id"),
        canonical=item.get("canonical"),
        urls_alias=item.get("urls_alias", []),
        fecha_alta=datetime.now().isoformat(),
    ) for item in data]


def formatear_clp(v: float | None) -> str:
    if v is None:
        return "?"
    return f"${v:,.0f}".replace(",", ".")


def procesar_producto(repo, producto: Producto) -> CambioPrecio | None:
    # Usar URL por ID (más estable) o la preferida
    url = producto.url_por_id or producto.url_preferida
    if not url:
        print(f"   ⚠️  {producto.product_id}: sin URL")
        return None

    print(f"🔍 [{producto.product_id}] {producto.nombre}")
    print(f"    {url}")

    snap = scrapear(producto.product_id, url)

    if snap.error:
        print(f"    ❌ {snap.error}")
        repo.guardar_snapshot(snap)  # guardamos el error para trazabilidad
        return None

    # Detectar cambio ANTES de guardar (comparar con el último)
    cambio = repo.detectar_cambio(producto.product_id, snap.precio)

    # Guardar snapshot
    repo.guardar_snapshot(snap)

    # Reportar
    emoji = {
        "nuevo": "🆕", "subio": "📈", "bajo": "📉",
        "igual": "➡️", "sin_datos": "❓",
    }.get(cambio.cambio, "•")

    if cambio.cambio == "nuevo":
        print(f"    {emoji} {snap.precio_texto}  ({snap.stock})")
    elif cambio.cambio == "igual":
        print(f"    {emoji} {snap.precio_texto}  (sin cambios)")
    else:
        signo = "+" if cambio.delta > 0 else ""
        print(f"    {emoji} {formatear_clp(cambio.precio_anterior)} → "
              f"{formatear_clp(cambio.precio_actual)}  "
              f"({signo}{cambio.delta_pct:.1f}%)")

    return cambio


def main():
    print("=" * 60)
    print(f"TRACKER DE PRECIOS · {datetime.now():%Y-%m-%d %H:%M}")
    print("=" * 60)

    repo = crear_repositorio()
    watchlist = cargar_watchlist(config.WATCHLIST_PATH)
    print(f"📋 {len(watchlist)} productos en watchlist\n")

    # Persistir productos en DB (upsert)
    for p in watchlist:
        repo.upsert_producto(p)

    cambios = []
    for i, p in enumerate(watchlist, 1):
        print(f"[{i}/{len(watchlist)}]")
        cambio = procesar_producto(repo, p)
        if cambio:
            cambios.append(cambio)
        if i < len(watchlist):
            time.sleep(random.uniform(config.PAUSA_MIN, config.PAUSA_MAX))
        print()

    # Resumen
    print("=" * 60)
    print("📊 RESUMEN")
    print("=" * 60)
    bajadas = [c for c in cambios if c.cambio == "bajo"]
    subidas = [c for c in cambios if c.cambio == "subio"]
    iguales = [c for c in cambios if c.cambio == "igual"]
    nuevos = [c for c in cambios if c.cambio == "nuevo"]

    print(f"🆕 Nuevos:     {len(nuevos)}")
    print(f"📉 Bajaron:    {len(bajadas)}")
    print(f"📈 Subieron:   {len(subidas)}")
    print(f"➡️  Iguales:    {len(iguales)}")

    # Alertas
    if bajadas:
        print()
        print("🚨 ALERTAS DE BAJADA:")
        for c in bajadas:
            if abs(c.delta_pct) >= config.ALERTA_UMBRAL_PCT:
                print(f"   [{c.product_id}] {formatear_clp(c.precio_anterior)} → "
                      f"{formatear_clp(c.precio_actual)}  "
                      f"({c.delta_pct:+.1f}%)")

    repo.cerrar()


if __name__ == "__main__":
    main()