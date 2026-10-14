# Scraper de Precios — Casa Amarilla

Tracker de histórico de precios para [casamarilla.cl](https://casamarilla.cl). Scrapea productos periódicamente, almacena snapshots en SQLite, y detecta cambios de precio.

---

## Cómo funciona (workflow completo)

El scraper resuelve un problema fundamental: **Casa Amarilla no tiene un estándar de URL para sus productos.** Un mismo bajo eléctrico puede vivir en:

- `casamarilla.cl/ACTION-JUNIOR-OPBC` (slug SEO)
- `casamarilla.cl/037-8501-569` (código de parte)
- `casamarilla.cl/index.php?route=product/product&product_id=14443` (URL interna de OpenCart)

Las tres apuntan al mismo producto, pero sin entrar a la página no hay forma de saber cuál es su `product_id` real. Por eso el flujo se divide en **dos fases**:

### Fase 1: Resolución de URLs → watchlist (se corre una vez)

```
URLs mixtas del usuario
        │
        ▼
  ¿La URL tiene product_id
   en el query string?
        │
   Sí ──┤── No
   │         │
   │    Visitar la URL (HTTP GET)
   │    Parsear HTML con BeautifulSoup
   │    Extraer product_id de:
   │      1. <input name="product_id" value="14443">
   │      2. Query string de la URL final (si hubo redirect)
   │         │
   └────────►│
             ▼
   Consultar endpoint JSON:
   /_ca_product.php?product_id=14443
             │
             ▼
   Enriquecer datos: nombre, marca, SKU,
   precio actual, stock, categorías
             │
             ▼
   Deduplicar por product_id
   (colapsar alias en un solo registro)
             │
             ▼
       watchlist.json
```

**¿Por qué este flujo y no otro?**

1. **¿Por qué no scrapear el sitemap para descubrir productos?** Porque el sitemap (`sitemap.xml`) que tiene el sitio es de `xprostore.com`, no de Casa Amarilla. No sirve para descubrir sus productos. La entrada de URLs es manual.

2. **¿Por qué extraer `product_id` del HTML?** Porque los slugs SEO (`/ACTION-JUNIOR-OPBC`) no contienen el ID interno. El único lugar donde aparece en el HTML estático es un `<input type="hidden" name="product_id" value="14443">` dentro de un div con clase `ca-pdp-mount`. Lo demás (precio, stock, nombre) se renderiza vía JavaScript y **no está en el HTML estático**.

3. **¿Por qué usar el endpoint JSON `/_ca_product.php` en vez de parsear el HTML?** Porque el sitio migró a un render 100% client-side para el PDP. El JS (`casa_amarilla_pdp.js`) llama internamente a `/_ca_product.php?product_id=X` (o `?sku=X`) y renderiza los datos con JavaScript. El HTML que devuelve el servidor **no tiene precio, stock, ni nombre** — solo el input hidden con el `product_id`. Parsear HTML solo nos da el ID; para los datos reales necesitamos el mismo endpoint que usa el frontend.

4. **¿Por qué deduplicar por `product_id`?** Porque el usuario puede alimentar URLs repetidas sin saberlo (el slug y la URL por ID del mismo producto). Sin deduplicación, el tracker haría requests duplicados y la DB tendría registros confusos.

5. **¿Por qué guardar `url_por_id` además de la `canonical`?** Porque el `url_por_id` (`/index.php?route=product/product&product_id=14443`) es la más estable. Los slugs SEO pueden cambiar si el administrador de la tienda renombra el producto. El `product_id` interno es permanente.

### Fase 2: Tracking periódico (se corre con cron)

```
watchlist.json
        │
        ▼
  Para cada producto:
        │
        ▼
   Consultar endpoint JSON
   /_ca_product.php?product_id=X
        │
   ¿Respondió ok?
   Sí ──┤── No
   │         │
   │    Fallback: visitar URL HTML,
   │    extraer product_id del <input>,
   │    reintentar JSON con ese ID
   │         │
   └────────►│
             ▼
   Crear PrecioSnapshot (precio, stock, timestamp)
             │
             ▼
   Comparar con el último snapshot en DB
   → detectar: subió / bajó / igual / nuevo
             │
             ▼
   Guardar snapshot en SQLite
   Emitir alerta si bajó más de 5%
```

**¿Por qué este flujo y no otro?**

1. **¿Por qué JSON primario con fallback HTML?** Porque el endpoint JSON es más rápido (~3KB vs ~42KB del HTML), más confiable (datos estructurados en vez de selectores CSS frágiles), y devuelve los datos limpios (precio como `int 199000` vs string `"$199.000"`). Pero si Casa Amarilla desactiva ese endpoint, el fallback HTML al menos puede extraer el `product_id` para intentar otra vía.

2. **¿Por qué comparar ANTES de guardar?** Porque `detectar_cambio()` compara el precio actual con el último snapshot en la DB. Si guardáramos primero, estaríamos comparando el snapshot consigo mismo, y siempre daría "igual".

3. **¿Por qué guardar snapshots con error?** Para trazabilidad. Si un producto empieza a dar 403 o deja de existir, el historial muestra cuándo empezó a fallar, no simplemente un "hueco" sin datos.

4. **¿Por qué pausas de 2-4 segundos entre requests?** Para no ser bloqueado. El `robots.txt` de Casa Amarilla no impone un `Crawl-delay`, pero hacer requests sin pausa a un sitio OpenCart con pocos recursos es agresivo. 2-4 segundos aleatorios simulan un usuario humano.

5. **¿Por qué `requests.Session`?** Reutiliza la conexión TCP (evita un handshake TLS nuevo en cada request) y mantiene cookies entre requests. Esto hace que el servidor nos vea como un visitante que navega, no como N conexiones aisladas. Además, reduce la latencia.

---

## Estructura del proyecto

```
First try/
├── config.py               # Configuración centralizada
├── models.py               # Dataclasses (Producto, PrecioSnapshot, CambioPrecio)
├── scraper.py              # Lógica de scraping (agnóstica a la DB)
├── tracker.py              # Orquestador: lee watchlist → scrapea → guarda
├── resolver_watchlist.py   # Resuelve URLs mixtas → watchlist deduplicada
├── db/
│   ├── __init__.py         # Exporta crear_repositorio()
│   ├── base.py             # Interfaz abstracta (Repository pattern)
│   ├── sqlite_backend.py   # Implementación SQLite
│   ├── postgres_backend.py # Placeholder para migración futura
│   └── factory.py          # Fábrica que elige backend según config
├── requirements.txt
└── how to use.sh
```

---

## Archivo por archivo

### `config.py`

Configuración central del proyecto. Todo parámetro modificable vive aquí, no hardcodeado en los módulos.

| Variable | Qué hace | Valor por defecto |
|----------|----------|-------------------|
| `DB_BACKEND` | Backend de persistencia | `"sqlite"` |
| `SQLITE_PATH` | Ruta del archivo SQLite | `"precios.db"` |
| `WATCHLIST_PATH` | Ruta del JSON de watchlist | `"watchlist.json"` |
| `HEADERS` | Headers HTTP para simular Chrome | User-Agent Chrome 120 |
| `PAUSA_MIN` / `PAUSA_MAX` | Rango de espera entre requests (seg) | 2.0 / 4.0 |
| `ALERTA_UMBRAL_PCT` | % mínimo de baja para emitir alerta | 5.0 |

**Decisión de diseño:** Los headers y pausas están aquí y no en el scraper para poder ajustarlos sin tocar lógica. Si Casa Amarilla empezara a bloquear, solo cambias el User-Agent aquí.

### `models.py`

Define tres dataclasses que representan las entidades del dominio:

- **`Producto`**: Metadatos de un producto trackeado (product_id, nombre, marca, SKU, URLs).
- **`PrecioSnapshot`**: Una medición de precio en un momento dado (producto, precio, stock, timestamp, error).
- **`CambioPrecio`**: Resultado de comparar el precio actual con el anterior (subió, bajó, igual, nuevo).

**Decisión de diseño:** Se usan `dataclasses` en vez de dicts para tener autocompletado, tipado, y `to_dict()` para serialización. Son agnósticas al backend de DB — no saben nada de SQLite ni PostgreSQL.

### `scraper.py`

Módulo puro de extracción de datos. Recibe un `product_id` y una URL, devuelve un `PrecioSnapshot`. No sabe nada de bases de datos ni de watchlists.

**Flujo interno de `scrapear()`:**

1. Intenta `/_ca_product.php?product_id=X` (JSON, ~3KB de respuesta).
2. Si falla: visita la URL HTML, extrae `product_id` del `<input>` hidden, reintenta JSON.
3. Si todo falla: devuelve un `PrecioSnapshot` con campo `error`.

**Decisión de diseño:** `_get_session()` usa lazy initialization (se crea al primer uso). Esto evita crear una sesión HTTP si el módulo se importa pero nunca se usa. También permite que tests unitarios la reemplacen.

**Decisión de diseño:** El import de `BeautifulSoup` está dentro de `_extraer_product_id_html()`, no a nivel de módulo. Esto es intencional: en el flujo principal (JSON), BeautifulSoup nunca se importa ni se usa, ahorrando tiempo de carga. Solo se importa si el fallback HTML se activa.

### `resolver_watchlist.py`

Toma una lista de URLs de producto en cualquier formato y produce una `watchlist.json` deduplicada.

**Qué hace `resolver_url()` por cada URL:**

1. Parsea la URL para ver si ya contiene `product_id` en el query string.
2. Si no, hace HTTP GET a la URL, parsea el HTML con BeautifulSoup, y extrae `product_id` del `<input>` hidden.
3. Con el `product_id`, consulta el endpoint JSON para obtener nombre, marca, precio, stock, SKU.
4. Guarda todo en un dict con la URL original, la URL final (post-redirect), y la canonical.

**Qué hace `deduplicar_por_product_id()`:**

Agrupa los resultados por `product_id`. Si dos URLs distintas apuntaban al mismo producto (ej: el slug y la URL por ID), las colapsa en un solo registro y guarda las URLs alternativas como "alias".

**Decisión de diseño:** El resolver tiene sus propios `HEADERS` más completos (con `Sec-Fetch-*`) que los de `config.py`. Esto es porque el resolver visita páginas HTML donde el servidor puede inspeccionar más headers, mientras que el scraper diario solo usa el endpoint JSON donde esos headers son innecesarios. Esto podría unificarse en `config.py` si se prefiere un solo punto de configuración.

### `tracker.py`

Orquestador. Es el script que se corre periódicamente (con cron, manualmente, etc.).

**Flujo de `main()`:**

1. Crea el repositorio de DB según `config.DB_BACKEND`.
2. Lee `watchlist.json` y carga cada producto como un objeto `Producto`.
3. Hace `upsert_producto()` para cada producto (lo crea si no existe, lo actualiza si ya está).
4. Para cada producto: scrapea el precio actual, lo compara con el último snapshot, guarda el nuevo snapshot, y reporta el cambio.
5. Imprime un resumen final (cuántos subieron, bajaron, nuevos, iguales).
6. Si hubo bajadas mayores al umbral configurado, emite alertas.

**Decisión de diseño:** `procesar_producto()` usa `url_por_id` (la URL construida con `product_id`) como primera opción. Esto es porque el `product_id` nunca cambia, mientras que el slug SEO podría cambiar si el administrador de la tienda renombra el producto. Si `url_por_id` no está disponible, usa `url_preferida` (la canonical).

**Decisión de diseño:** Los errores de scraping se guardan en la DB (`repo.guardar_snapshot(snap)` incluso cuando hay error). Esto mantiene trazabilidad: si un producto deja de responder, el historial muestra cuándo ocurrió y no simplemente un vacío.

### `db/base.py`

Interfaz abstracta del repositorio (Repository pattern). Define los métodos que cualquier backend de base de datos debe implementar:

- `upsert_producto()`, `obtener_producto()`, `listar_productos()`
- `guardar_snapshot()`, `obtener_ultimo_snapshot()`, `obtener_historial()`
- `detectar_cambio()`
- `cerrar()`

**Decisión de diseño:** Se usa el Repository pattern para desacoplar la lógica de scraping de la capa de persistencia. `scraper.py` y `tracker.py` nunca importan SQLite directamente — solo usan la interfaz `PrecioRepository`. Esto permite cambiar de SQLite a PostgreSQL sin tocar el código de scraping.

### `db/sqlite_backend.py`

Implementación concreta de `PrecioRepository` usando SQLite.

**Schema:**

- Tabla `productos`: product_id (PK), nombre, marca, sku, url_preferida, url_por_id, canonical, urls_alias (JSON), fecha_alta.
- Tabla `precios`: id (autoincrement), product_id (FK), precio, precio_texto, stock, url_usada, url_final, timestamp, error.
- Índice compuesto en `(product_id, timestamp DESC)` para consultas rápidas del último precio.

**Decisión de diseño:** `urls_alias` se guarda como JSON serializado en un campo TEXT. SQLite no tiene tipo JSON nativo, y para esta cantidad de datos (decenas de alias como máximo) un campo TEXT con `json.dumps/loads` es más simple que una tabla de join.

**Decisión de diseño:** `detectar_cambio()` busca el último snapshot **sin error** (`WHERE error IS NULL`). Si el último scraping falló, la comparación se hace contra el último precio válido, no contra un registro de error.

### `db/factory.py`

Fábrica que instancia el repositorio correcto según `config.DB_BACKEND`. El resto del código llama a `crear_repositorio()` sin saber qué backend hay detrás.

### `db/postgres_backend.py`

Placeholder para migración futura a PostgreSQL. Existe como esqueleto para cuando se necesite escalar.

---

## Cómo probar

### Test rápido (1 solo request)

```bash
cd "First try"
python3 -c "
from resolver_watchlist import resolver_url
r = resolver_url('https://casamarilla.cl/ACTION-JUNIOR-OPBC')
for k, v in r.items():
    print(f'  {k}: {v}')
"
```

### Generar watchlist

```bash
python3 resolver_watchlist.py
```

### Ejecutar tracker (primer snapshot)

```bash
python3 tracker.py
```

### Verificar la DB

```bash
python3 -c "
import sqlite3
conn = sqlite3.connect('precios.db')
print('Productos:', conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0])
print('Snapshots:', conn.execute('SELECT COUNT(*) FROM precios').fetchone()[0])
for row in conn.execute('SELECT product_id, precio, stock, timestamp FROM precios WHERE error IS NULL'):
    print(f'  [{row[0]}] \${row[1]:,.0f} | {row[2]} | {row[3]}')
"
```

---

## Dependencias

```
requests>=2.31.0
beautifulsoup4>=4.12.0
lxml>=5.0.0
```

`lxml` es el parser de BS4. Es más rápido que el parser built-in de Python, aunque en este proyecto el HTML se parsea solo como fallback (la fuente primaria es JSON).

---

## robots.txt de Casa Amarilla

La ruta `/index.php?route=product/product` **no está bloqueada.** Solo están bloqueadas:
- `product/amp_product` (versiones AMP)
- `product/search` (búsquedas)
- Rutas de cuenta, checkout, admin

El endpoint `/_ca_product.php` tampoco está mencionado en el robots.txt (ni para permitir ni para bloquear), lo que implica que está permitido por defecto.

---

## Lección aprendida: cómo descubrir endpoints ocultos

El hallazgo más importante de este proyecto fue descubrir que Casa Amarilla tiene un **endpoint JSON interno** (`/_ca_product.php`) que devuelve todos los datos de un producto de forma limpia. Este endpoint no está documentado en ningún lado — es de uso interno del frontend. Encontrarlo cambió completamente la arquitectura del scraper: pasamos de parsear HTML frágil a consumir un API JSON estable.

Acá está el proceso exacto que se siguió, paso a paso, para que sirva de referencia en futuros proyectos de scraping:

### Paso 1: Los selectores CSS dejaron de funcionar

El scraper original usaba selectores como `section.ca-pdp`, `.ca-pdp__price-now`, `.ca-pdp__stock-badge` para extraer datos del HTML. Al probarlo contra el sitio actual, todos devolvieron `None`. El selector de sección raíz (`section.ca-pdp`) ya no existía.

**Lección:** Los selectores CSS son frágiles. Un rediseño del frontend los rompe sin aviso. Siempre hay que asumir que van a cambiar.

### Paso 2: Inspeccionar qué SÍ existe en el HTML

Se hizo un HTTP GET a una URL de producto y se buscó en el HTML estático:

```python
soup.select_one("input[name='product_id']")  # → value="14443" ✅
soup.select_one("link[rel='canonical']")      # → href="..." ✅
soup.select_one("div.ca-pdp-mount")           # → existe pero vacío
```

El `product_id` seguía disponible en un `<input hidden>`. Pero **no había precio, stock, ni nombre en el HTML**. Solo un `<div class="ca-pdp-mount">` vacío.

**Lección:** Si ves un div vacío con una clase que dice "mount" o "root", es casi seguro que un framework JavaScript (React, Vue, etc.) lo rellena después de cargar. Los datos no están en el HTML estático.

### Paso 3: Buscar los archivos JavaScript del PDP

Se listaron todos los `<script src="...">` de la página y se filtraron los que tenían "pdp" o "product" en el nombre:

```python
for s in soup.find_all('script', src=True):
    if 'pdp' in s['src'].lower() or 'product' in s['src'].lower():
        print(s['src'])
```

Resultado:
```
catalog/view/theme/casa_amarilla/javascript/casa_amarilla_pdp.js?v=3
```

**Lección:** Los sitios que renderizan del lado del cliente **siempre** necesitan obtener los datos de algún lugar. Ese "algún lugar" suele ser un endpoint AJAX/API que el JavaScript llama. Si encontrás el JS que renderiza la página, encontrás el endpoint.

### Paso 4: Leer el JavaScript

Se descargó `casa_amarilla_pdp.js` y se leyeron los primeros bytes. El comentario del archivo decía literalmente:

```
APPROACH DEFINITIVO:
- Consume JSON endpoint propio: /_ca_product.php?sku=XXX
- NO depende del DOM enriquecido por xpro_core.js
- Lectura desde DB OC vía endpoint PHP server-side
```

**Lección:** Los desarrolladores dejan comentarios en el JavaScript. Aunque el código esté minificado, muchas veces los headers/comentarios quedan intactos. Siempre vale la pena leer los primeros KB de un JS relevante.

### Paso 5: Probar el endpoint

Se probó el endpoint con distintos parámetros:

```python
# Con product_id → ✅ funciona
requests.get('/_ca_product.php?product_id=14443')

# Con SKU → ✅ funciona  
requests.get('/_ca_product.php?sku=ACTION-JUNIOR-OPBC')

# Con "id" → ❌ error "missing_sku_or_product_id"
requests.get('/_ca_product.php?id=14443')
```

La respuesta JSON contenía **todo**: `product_id`, `sku`, `title`, `brand`, `price_now` (como int, ya limpio), `price_old`, `discount_percent`, `stock` (con quantity y in_stock), `gallery`, `description`, `categories`, `reviews`.

**Lección:** Una vez que encontrás el endpoint, probalo con distintos parámetros para entender qué acepta. Muchas APIs internas son más permisivas de lo esperado.

### Metodología general para futuros scrapers

Cuando un sitio no devuelve datos en el HTML estático:

1. **Abrir DevTools → Network → XHR/Fetch** en el navegador y recargar la página. Todos los endpoints AJAX aparecen ahí. (Esto es lo más rápido, pero requiere un navegador.)

2. **Buscar `<script src>` relevantes** en el HTML y leer el contenido del JS. Buscar strings como `fetch(`, `axios.`, `$.ajax`, `XMLHttpRequest`, o URLs que empiecen con `/api/`, `/_`, `/wp-json/`, etc.

3. **Buscar datos embebidos en el HTML** como `window.__INITIAL_STATE__`, `window.__NEXT_DATA__`, o variables `var productData = {...}` dentro de `<script>` inline. Muchos frameworks SSR (Next.js, Nuxt) embeben los datos como JSON dentro del HTML.

4. **Grep en el JavaScript** por keywords del dominio: `product_id`, `price`, `stock`, el nombre del framework de la tienda (OpenCart, Shopify, WooCommerce).

5. **Revisar las cookies y headers** que el JS envía. Algunos endpoints internos requieren un token CSRF o una cookie de sesión que se obtiene al visitar la página primero (por eso `requests.Session` es importante).

El principio es siempre el mismo: **si el navegador puede ver los datos, hay un endpoint que los sirve. Solo hay que encontrarlo.**
