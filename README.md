# 📊 Academic Dashboard

Sistema de visualización de datos académicos con arquitectura en capas.

## Estructura del proyecto

```
├── backend/          ← API unificada (Express + TypeScript + PostgreSQL)
└── dashboard-dwh/    ← Frontend (React + Vite + Recharts)
```

## 🚀 Cómo levantar

Necesitas **2 terminales**:

**Terminal 1 — Backend**
```bash
cd backend
npm install
npm run dev
# http://localhost:3000
```

**Terminal 2 — Frontend**
```bash
cd dashboard-dwh
npm install
npm run dev
# http://localhost:5173
```

Luego abre **http://localhost:5173** en el navegador.

## Variables de entorno

Copia `backend/.env.example` a `backend/.env` y completa:

```
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=development
```
