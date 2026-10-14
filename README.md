# CC5003-SoloTono

Comparador de precios de instrumentos musicales con arquitectura cliente/servidor.  
Frontend en React + Vite y backend en Express + Mongoose/MongoDB.

## Propósito

Permitir buscar instrumentos musicales, filtrar el catálogo y comparar ofertas entre tiendas, mostrando precio, stock y disponibilidad. También tiene autenticación de usuarios, favoritos/preferencias, publicaciones, comentarios y registro de historial de precios para sostener futuras funcionalidades de alertas o análisis.

El proyecto está parcialmente migrado desde datos en memoria hacia MongoDB. El frontend sigue funcionando mientras la base de datos se usa como fuente principal de productos y ofertas.

## Estructura general

```text
CC5003-SoloTono/
├── backend/                 # API REST TypeScript con Express + Mongoose
├── frontend/                # SPA React + Vite + TypeScript
├── scraper casamarilla/      # Scraper Python independiente (no participa del build de la app)
├── Plan-de-Implementacion.md
├── AGENTS.md
└── README.md
```

## Stack

### Backend
- Node.js 24
- Express 5
- TypeScript (nodenext, `--experimental-strip-types` en dev)
- Mongoose 8
- MongoDB
- JWT en cookie httpOnly + token CSRF
- bcrypt

### Frontend
- React 19
- Vite
- TypeScript estricto
- Axios
- React Router

## Estado actual de implementación

### Completado
1. **Infraestructura y conexión MongoDB**
   - `backend/src/config.ts` valida variables de entorno requeridas.
   - `backend/src/index.ts` conecta a MongoDB antes de levantar el servidor.
   - CORS configurado para `http://localhost:5173`.
   - Endpoints de auth montados en `/api/auth`.

2. **Modelos Mongoose**
   - `User`
   - `Product`
   - `StoreOffer`
   - `PriceHistory`
   - `Publication`
   - `Comment`
   - `ActivityLog`

3. **Seed y transición a MongoDB**
   - `backend/src/seed.ts` importa los datos de `backend/src/data/productsData.ts`.
   - Crea productos y ofertas en MongoDB.
   - Los endpoints de productos ahora consultan Mongo en vez de memoria.

4. **Integración del scraper (canal de ingesta)**
   - `POST /api/internal/scraper/sync` protegido con API key.
   - Crea/actualiza ofertas.
   - Registra `PriceHistory` solo si cambió el precio o es una oferta nueva.
   - Recalcula `minPrice`, `maxPrice` y `availableStores` del producto.

### Pendiente
1. **Scraper final**
   - Integrar el scraper Python existente con el endpoint de ingesta.
   - Adaptar payloads y automatizar ejecución para otras tiendas.
2. **Funcionalidades opcionales**
   - `make-moderator` aún no implementado.
   - Algunos campos de favoritos/preferencias todavía requieren wiring adicional en frontend/backend.
3. **Refinamientos de frontend**
   - `frontend/src/services/products.ts` mantiene `FALLBACK_PRODUCTS`, que puede ocultar fallos del backend.
   - El cliente de auth usa `http://localhost:3001` absoluto, mientras productos usan `/api` relativo.

## Estructura del backend

```text
backend/
├── .env.example
├── package.json
├── tsconfig.json
└── src/
    ├── config.ts
    ├── index.ts
    ├── data/
    │   └── productsData.ts
    ├── middleware/
    │   ├── auth.ts
    │   ├── errorHandler.ts
    │   └── roles.ts
    ├── models/
    │   ├── User.ts
    │   ├── Product.ts
    │   ├── StoreOffer.ts
    │   ├── PriceHistory.ts
    │   ├── Publication.ts
    │   ├── Comment.ts
    │   ├── ActivityLog.ts
    │   └── shared.ts
    ├── routes/
    │   ├── auth.ts
    │   ├── scraper.ts
    │   └── express.d.ts
    └── utils/
        ├── errors.ts
        ├── logger.ts
        └── pick.ts
```

## Base de datos

Colecciones principales:

### `users`
- `username`
- `name`
- `email`
- `passwordHash`
- `role` (`user`, `moderator`)
- `favorites` (ObjectId ref Product)
- `preferredCategories` (string[])
- timestamps

### `products`
- `name`
- `slug` (único)
- `brand`
- `category`
- `section`
- `subCategory`
- `imageUrl`
- `description`
- `specs` (map string)
- `minPrice`
- `maxPrice`
- `availableStores` (string[])
- timestamps

### `storeoffers`
- `product` (ObjectId ref Product, opcional)
- `storeName`
- `storeProductId`
- `sku`
- `productUrl` (único)
- `priceCash`
- `priceNormal`
- `inStock`
- `lastScrapedAt`
- timestamps

### `pricehistories`
- `offer` (ObjectId ref StoreOffer)
- `product` (ObjectId ref Product)
- `priceCash`
- `priceNormal`
- `date`

### `publications`
- `user`
- `product` (opcional)
- `title`
- `content`
- timestamps

### `comments`
- `publication`
- `user`
- `content`
- timestamps

### `activitylogs`
- `user`
- `product`
- `actionType` (`VIEW`, `CLICK_OFFER`, `FAVORITE`, `COMMENT`)
- `createdAt` (expira en 90 días)

## Variables de entorno

Ver `backend/.env.example`.

Variables requeridas:
- `PORT`
- `MONGODB_URI`
- `MONGODB_DBNAME`
- `JWT_SECRET`

Para tests:
- `TEST_MONGODB_URI`
- `TEST_MONGODB_DBNAME`

Para scraper:
- `SCRAPER_API_KEY`

## Comandos

### Backend
```bash
cd backend
npm install
npm run dev     # Node 24 con --experimental-strip-types --watch
npm run build   # tsc como chequeo de tipos
npm run seed    # importa productos en MongoDB
npm test        # requiere TEST_MONGODB_URI
```

### Frontend
```bash
cd frontend
npm install
npm run dev     # Vite, proxy /api a http://localhost:3001
npm run build
npm run lint
```

## API principal

- `GET /api/health`
- `GET /api/categories`
- `GET /api/stores`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/internal/scraper/sync` (protegido por API key)

## Organización de scrapers

Para que los 6 devs no se estorben ni hagan cambios al backend, sigan esta estructura:

```text
scrapers/
├── common/        # utilidades compartidas: HTTP, retry, normalización, cliente API
├── audiomusica/
├── casamarilla/
├── <tienda>/
└── ...
docs/scraper-research/   # investigaciones y HTMLs de referencia, no código ejecutable
```

Reglas:
- No modificar backend ni modelos Mongo desde ramas de scraper sin PR.
- Todos los scrapers envían datos solo a `/api/internal/scraper/sync`.
- Cada scraper debe transformar sus datos al payload definido en `docs/scraper-api.md` (pendiente de crear) antes de enviarlos.
- No commitear HTML crudo ni datos pesados de scraping; solo código y documentación útil.
- Crear rama por tienda: `scraper/<tienda>`.
- Utilidades compartidas solo en `scrapers/common/`.

## Notas operativas

- La app asume backend en `localhost:3001` y frontend en `localhost:5173`.
- MongoDB debe estar corriendo antes de arrancar el backend.
- `npm run build` no emite archivos en `out/` (`noEmit: true`), por eso se usa como typecheck.
- `scraper casamarilla/` es independiente y no forma parte de la build del frontend/backend.
