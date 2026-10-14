def deduplicar_watchlist(resultados):
    """Elimina duplicados manteniendo el primer registro por product_id."""
    vistos = {}
    for r in resultados:
        if "error" in r:
            continue
        pid = r.get("product_id")
        if not pid:
            continue
        if pid not in vistos:
            vistos[pid] = r
    return list(vistos.values())