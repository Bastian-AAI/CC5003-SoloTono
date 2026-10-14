"""
Configuración del proyecto. Cambia aquí sin tocar código.
"""

# ---------- Backend de DB ----------
DB_BACKEND = "sqlite"          # "sqlite" | "postgres" | "mysql" | ...
SQLITE_PATH = "precios.db"
POSTGRES_DSN = "postgresql://user:pass@localhost:5432/precios"

# ---------- Scraper ----------
WATCHLIST_PATH = "watchlist.json"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
    "Upgrade-Insecure-Requests": "1",
}
PAUSA_MIN = 2.0
PAUSA_MAX = 4.0

# ---------- Alertas ----------
ALERTA_UMBRAL_PCT = 5.0   # alertar si baja más de 5%