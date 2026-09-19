# CC5003-SoloTono

Proyecto para el curso CC5003 con arquitectura cliente-servidor en TypeScript.

## Estructura del Proyecto

```text
CC5003-SoloTono/
├── backend/            # API REST con Express y TypeScript
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/           # Aplicación web con React, Vite y TypeScript
    ├── src/
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## Instrucciones de Ejecución

### 1. Backend

```bash
cd backend
npm install
npm run dev     # Inicia el servidor en http://localhost:3001 con auto-reload
npm run build   # Compila TypeScript a JavaScript en ./out
npm start       # Ejecuta la build compilada
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # Inicia el servidor Vite de desarrollo
npm run build   # Compila la aplicación React para producción
```
