# SoloTono - Frontend

Aplicacion web SPA desarrollada con React 19, TypeScript, Vite y Material UI (MUI).

## Vistas Principales

- `/` (`HomePage`): Pagina de inicio con instrumentos destacados y navegacion por Mega-Menu.
- `/catalogo` (`CatalogPage`): Catalogo general con filtros reactivos por seccion, categoria, tienda, disponibilidad de stock, busqueda de texto y ordenamiento.
- `/producto/:id` (`ProductDetailPage`): Ficha detallada del instrumento con comparativa de precios entre tiendas, grafico de evolucion historica y boton para guardar en favoritos.
- `/favoritos` (`FavoritesPage`): Vista protegida para usuarios autenticados que permite gestionar instrumentos guardados, notas personales y precios objetivo.
- `/admin` (`AdminPage`): Vista protegida para usuarios con rol `admin` que permite crear, editar y eliminar productos, tiendas, categorias y gestionar roles de usuarios.
- `/login` y `/register` (`AuthPages`): Vistas de inicio de sesion y registro de cuentas de usuario.

## Comandos

Desde la raiz del monorepo:

```bash
npm run dev:frontend
npm run build:frontend
```

O directamente desde el directorio `frontend/`:

```bash
npm install
npm run dev
npm run build
npm run lint
```
