# 📊 Academic Dashboard

Sistema de visualización de datos académicos.

## 🚀 Cómo levantar

### Primera vez — instalar todas las dependencias:
```bash
npm run install:all
```

### Levantar todo con un solo comando:
```bash
npm run dev
```

Esto inicia simultáneamente:
- **Backend** → `http://localhost:3000`
- **Frontend** → `http://localhost:5173`

Abre `http://localhost:5173` en el navegador.

## Variables de entorno

Crea el archivo `backend/.env` basándote en `backend/.env.example`:
```
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=development
```

## Estructura

```
├── package.json       ← Scripts raíz (npm run dev levanta todo)
├── backend/           ← API Express + TypeScript + PostgreSQL
└── dashboard-dwh/     ← Frontend React + Vite + Recharts
```
