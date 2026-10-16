# CC5003-SoloTono

Plataforma web de comparacion de ofertas y seguimiento historico de precios para instrumentos musicales, equipos de sonido y accesorios en tiendas especializadas de Chile.

## Estructura del Proyecto

```text
CC5003-SoloTono/
├── docker-compose.yml   # Servicio PostgreSQL 16 (puerto 5432)
├── package.json         # Scripts unificados del monorepo
├── .env.example         # Plantilla de variables de entorno
├── scraper/             # Motor en Python de extraccion, normalizacion y matching (11 tiendas)
├── backend/             # API REST en TypeScript con Express 5 y PostgreSQL (puerto 3001)
└── frontend/            # Aplicacion SPA en React 19, TypeScript, Vite y MUI (puerto 5173)
```

## Prerrequisitos

- **Node.js** `>= 20.x` y **npm** `>= 10.x`
- **Python** `>= 3.10` con soporte para `venv` (`python3-venv`)
- **Docker** y **Docker Compose**

## Variables de Entorno

Antes de iniciar el proyecto, crea un archivo `.env` en la raiz del repositorio (y opcionalmente en `backend/.env`) a partir de `.env.example`:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Variables requeridas:

| Variable | Descripcion | Valor de ejemplo (desarrollo local) |
| :--- | :--- | :--- |
| `DATABASE_URL` | Cadena de conexion a PostgreSQL | `postgresql://postgres:postgres@localhost:5432/solotono` |
| `POSTGRES_USER` | Usuario del contenedor PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Contrasena del contenedor PostgreSQL | `postgres` |
| `POSTGRES_DB` | Nombre de la base de datos | `solotono` |
| `PORT` | Puerto HTTP del servidor backend | `3001` |
| `NODE_ENV` | Entorno de ejecucion (`development`, `production`, `test`) | `development` |
| `JWT_SECRET` | Secreto para firmar y verificar tokens JWT | `supersecretjwtkey_cc5003_solotono_dev_2026` |
| `VITE_API_URL` | URL base del backend para el frontend | `http://localhost:3001` |

## Ejecucion Local Paso a Paso

Ejecuta los siguientes comandos desde la raiz del repositorio:

```bash
# 1. Instalar dependencias de backend, frontend y entorno virtual de Python
npm run setup

# 2. Iniciar el contenedor de PostgreSQL en segundo plano
npm run db:up

# 3. Inicializar las tablas, tiendas y taxonomia de categorias
npm run scraper:init

# 4. Poblar el catalogo extrayendo productos de las tiendas (muestra inicial)
npm run scraper:scrape

# 5. Iniciar simultaneamente el backend (:3001) y el frontend (:5173)
npm run dev
```

Accesos locales una vez iniciado:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001/api/products`
- **Estado del servidor**: `http://localhost:3001/api/health`

## Comandos del Proyecto

Todos los scripts principales se ejecutan desde la raiz del proyecto:

| Comando | Descripcion |
| :--- | :--- |
| `npm run setup` | Instala dependencias de `backend`, `frontend` y configura `scraper/.venv`. |
| `npm run db:up` | Inicia el contenedor Docker `solotono-postgres` en el puerto `5432`. |
| `npm run db:down` | Detiene y elimina el contenedor de base de datos. |
| `npm run dev` | Levanta el backend y el frontend en paralelo con recarga en vivo. |
| `npm run dev:backend` | Inicia solo el servidor backend en `http://localhost:3001`. |
| `npm run dev:frontend` | Inicia solo el servidor de desarrollo frontend en `http://localhost:5173`. |
| `npm test` | Ejecuta la suite de pruebas de integracion del backend con PostgreSQL. |
| `npm run build` | Compila el backend (`tsc`) y el frontend (`vite build`). |
| `npm run make-admin <username>` | Asigna el rol `admin` a un usuario registrado en la base de datos. |

### Cuenta de Administrador

Al inicializar el esquema se crea automaticamente una cuenta de administrador para acceder a la vista `/admin`:
- **Usuario**: `admin`
- **Contrasena**: `admin12345`

Tambien puedes promover cualquier cuenta registrada ejecutando:
```bash
npm run make-admin <username>
```

## Comandos del Scraper

El motor de scraping cuenta con atajos `npm` y una interfaz CLI completa en Python.

### Atajos desde la raiz (`npm run`)

| Comando | Descripcion |
| :--- | :--- |
| `npm run scraper:setup` | Crea `scraper/.venv` e instala los paquetes de `scraper/requirements.txt`. |
| `npm run scraper:init` | Crea el esquema de tablas en PostgreSQL, registra las 11 tiendas y carga la taxonomia. |
| `npm run scraper:scrape` | Extrae una muestra rapida (10 productos por tienda) y ejecuta el matching de ofertas. |
| `npm run scraper:scrape:all` | Extrae el inventario completo de todas las tiendas sin limite de productos (`--all`). |
| `npm run scraper:stats` | Muestra en terminal el resumen de tiendas, productos canonicos, entidades e historial. |
| `npm run scraper:menu` | Imprime el arbol de secciones, grupos, categorias y subcategorias. |

### Uso avanzado de la CLI del Scraper

```bash
# Reiniciar todas las tablas desde cero y cargar taxonomia
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono init-db --drop

# Extraer productos de una tienda especifica (con limite o catalogo completo)
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono scrape --store audiomusica --limit 30
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono scrape --store casamarilla --all

# Extraer todas las tiendas con un limite personalizado por tienda
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono scrape --limit 50

# Ejecutar el algoritmo de matching cross-store sobre entidades pendientes
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono match --threshold 0.90

# Clasificar entidades hacia categorias canonicas
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono classify --limit 50

# Inspeccionar entidades pendientes y asociar manualmente una entidad a un producto
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono pending --limit 20
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono pending --associate <entity_id> <product_id>

# Consultar el historial de precios de un producto especifico
PYTHONPATH=scraper scraper/.venv/bin/python3 -m solotono history <product_id>
```

## Endpoints Principales de la API REST

| Recurso | Endpoints | Permisos |
| :--- | :--- | :--- |
| Salud | `GET /api/health` | Publico |
| Autenticacion | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` | Publico / Sesion activa en `/me` |
| Productos | `GET /api/products`, `GET /api/products/:id`, `GET /api/products/:id/history`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id` | Lectura publica / Escritura `admin` |
| Tiendas | `GET /api/stores`, `GET /api/stores/:id`, `POST /api/stores`, `PUT /api/stores/:id`, `DELETE /api/stores/:id` | Lectura publica / Escritura `admin` |
| Categorias | `GET /api/categories`, `GET /api/categories/:id`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id` | Lectura publica / Escritura `admin` |
| Ofertas | `GET /api/offers`, `GET /api/offers/:id`, `POST /api/offers`, `PUT /api/offers/:id`, `DELETE /api/offers/:id` | Lectura publica / Escritura `admin` |
| Favoritos | `GET /api/favorites`, `GET /api/favorites/:id`, `POST /api/favorites`, `PUT /api/favorites/:id`, `DELETE /api/favorites/:id` | Usuario autenticado |
| Usuarios | `GET /api/users`, `GET /api/users/:id`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id` | Rol `admin` |
