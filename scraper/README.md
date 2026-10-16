# SoloTono - Motor de Scraping y Product Matching

Modulo en Python encargado de la extraccion de productos, normalizacion de marcas y modelos, clasificacion taxonomica, emparejamiento cross-store y registro historico de precios en PostgreSQL para las 11 tiendas musicales monitoreadas.

## Arquitectura del Motor

1. **Extraccion Hibrida (`solotono.scrapers`)**:
   - Conectores especializados por plataforma de comercio electronico: VTEX Catalog API, Shopify JSON API, OpenCart Journal API + Sitemaps XML, Jumpseller JSON, Magento 2 DOM/Microdata, PrestaShop y WooCommerce (con `curl_cffi` para mitigacion de bloqueos TLS/WAF).
2. **Ingesta e Historial de Precios (`solotono.pipeline`)**:
   - Separacion entre `Entity` (oferta individual de una tienda identificada por `(store_id, key)`) y `Product` (ficha canonica del catalogo).
   - Puntero `active_registry_id` en `Entity` hacia el ultimo registro en `EntityHistory` para consultas de precio vigente en tiempo constante.
   - Compresion por deltas: solo inserta un nuevo punto en `EntityHistory` cuando cambia el precio normal, el precio oferta o la disponibilidad de stock, o cuando transcurren mas de 24 horas.
3. **Emparejamiento de Productos (`solotono.matching`)**:
   - Etapa 1: Cruce determinista por numero de parte del fabricante (`part_number` / MPN) o codigo EAN.
   - Etapa 2: Normalizacion semantica de marca, serie y modelo con similitud difusa (`RapidFuzz`) y reglas de disyuncion estricta (orientacion diestro/zurdo, cantidad de cuerdas, serie, acabado, tipo de equipo y cantidad de unidades).
   - Etapa 3: Cola de entidades pendientes para asociacion manual desde la CLI.

## Tiendas Soportadas

| Tienda | Slug | Dominio | Plataforma | Estrategia |
| :--- | :--- | :--- | :--- | :--- |
| Audiomusica | `audiomusica` | `audiomusica.com` | VTEX | Catalog API JSON |
| ProMusic | `promusic` | `promusic.cl` | Shopify | API `/products.json` paginada |
| RD Musico | `rdmusico` | `rdmusico.cl` | Shopify | API `/products.json` paginada |
| Fat Store | `fatstore` | `fatstore.cl` | Shopify | API `/products.json` paginada |
| Fender Chile | `fender` | `fender.cl` | Magento | Sitemaps XML + DOM Microdata |
| Casa Amarilla | `casamarilla` | `casamarilla.cl` | OpenCart | API Journal + Sitemap XML |
| Music Chile | `musicchile` | `musicchile.cl` | Jumpseller | Categorias HTML + Payload JSON |
| Epic Music | `epicmusic` | `epicmusic.cl` | Jumpseller | Categorias HTML + Payload JSON |
| Instrumentos Chile | `instrumentoschile` | `instrumentoschile.cl` | Magento | Sitemap XML + DOM SKU |
| Factory Sound | `factorysound` | `factorysound.cl` | PrestaShop | Microdata `.product-miniature` |
| Overdrive | `overdrive` | `overdrive.cl` | WooCommerce | Sitemap XML + `curl_cffi` TLS |

## Instalacion del Entorno Python

Desde la raiz del repositorio principal:

```bash
npm run scraper:setup
```

O manualmente dentro del directorio `scraper/`:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Comandos del Scraper

### Scripts desde la raiz del proyecto (`npm run`)

| Comando | Descripcion |
| :--- | :--- |
| `npm run scraper:setup` | Crea el entorno virtual `scraper/.venv` e instala `scraper/requirements.txt`. |
| `npm run scraper:init` | Inicializa las tablas en PostgreSQL, registra las 11 tiendas y carga la taxonomia. |
| `npm run scraper:scrape` | Ejecuta una extraccion rapida de muestra (10 productos por tienda) y empareja ofertas. |
| `npm run scraper:scrape:all` | Extrae el catalogo completo de todas las tiendas sin limite de productos (`--all`). |
| `npm run scraper:stats` | Muestra en consola las metricas de tiendas, productos, entidades e historial. |
| `npm run scraper:menu` | Imprime en consola el arbol completo de secciones, categorias y subcategorias. |

### Uso directo de la CLI de Python (`python -m solotono`)

Todos los comandos pueden ejecutarse con `PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono <subcomando>`:

```bash
# 1. Inicializar base de datos (usar --drop para recrear las tablas desde cero)
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono init-db
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono init-db --drop

# 2. Extraer productos de todas las tiendas (muestra limitada o catalogo completo)
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono scrape --limit 25
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono scrape --all

# 3. Extraer productos de una tienda especifica (con limite o catalogo completo)
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono scrape --store audiomusica --limit 50
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono scrape --store casamarilla --all

# 4. Ejecutar el motor de matching sobre entidades pendientes
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono match --threshold 0.90

# 5. Clasificar entidades hacia categorias canonicas
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono classify --limit 50

# 6. Revisar cola de entidades pendientes y asociar manualmente a un producto
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono pending --limit 20
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono pending --associate <entity_id> <product_id>

# 7. Consultar el historial de precios de un producto canonico
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono history <product_id>

# 8. Visualizar o exportar el menu taxonomico (en consola o JSON)
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono menu
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono menu --json

# 9. Ver estadisticas generales de la base de datos
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono stats
```

## Pruebas del Scraper

```bash
PYTHONPATH=scraper scraper/.venv/bin/python3 -m unittest discover -s scraper/solotono/tests
```
