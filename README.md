# Academic Dashboard — DWH

Sistema de integración y visualización de datos académicos de la Universidad Mariana. Arquitectura de microservicios que consolida tres fuentes de datos heterogéneas en un Data Warehouse analítico.

---

## Arquitectura

```
┌─────────────────────┐   ┌──────────────────────┐   ┌───────────────────────────┐
│   academic-record   │   │   backend-library    │   │  backend-laboratories     │
│   localhost:3000    │   │   localhost:4000     │   │  localhost:3002           │
│   PostgreSQL/Neon   │   │   MongoDB Atlas      │   │  Archivos CSV             │
└────────┬────────────┘   └──────────┬───────────┘   └─────────────┬─────────────┘
         │                           │                              │
         └───────────────────────────┼──────────────────────────────┘
                                     ▼
                           ┌─────────────────────┐
                           │      core-dwh        │
                           │   localhost:3003     │
                           │  Orquestador ETL     │
                           └──────────┬──────────┘
                                      │
                                      ▼
                           ┌─────────────────────┐
                           │    dashboard-dwh     │
                           │   localhost:5173     │
                           │  React + Recharts    │
                           └─────────────────────┘
```

---

## Servicios

| Servicio | Puerto | Fuente de datos | Descripción |
|---|---|---|---|
| `academic-record` | 3000 | PostgreSQL (Neon) | Datos académicos: estudiantes, asignaturas, cursos, matrículas, calificaciones |
| `backend-library` | 4000 | MongoDB Atlas | Biblioteca: préstamos físicos, accesos a BD científicas, descargas |
| `backend-laboratories` | 3002 | Archivos CSV | Laboratorios: logs de acceso y uso de equipos |
| `core-dwh` | 3003 | Los 3 anteriores | Orquestador ETL — cruza datos y expone la API analítica |
| `dashboard-dwh` | 5173 | core-dwh | Frontend React con visualizaciones Recharts |

---

## Inicio rápido

### 1. Instalar todas las dependencias

```bash
npm run install:all
```

### 2. Configurar variables de entorno

Cada servicio tiene su propio `.env`. Copia el `.env.example` de cada carpeta y completa los valores:

```bash
cp academic-record/.env.example     academic-record/.env
cp backend-library/.env.example     backend-library/.env
cp backend-laboratories/.env.example backend-laboratories/.env
cp core-dwh/.env.example            core-dwh/.env
```

### 3. Levantar todo

```bash
npm run dev
```

Esto inicia los 5 servicios simultáneamente con salidas coloreadas por servicio. Abre `http://localhost:5173` en el navegador.

---

## Variables de entorno

### `academic-record/.env`
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
PORT=3000
NODE_ENV=development
```

### `backend-library/.env`
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/umariana_db
PORT=4000
NODE_ENV=development
```

### `backend-laboratories/.env`
```env
PORT=3002
NODE_ENV=development
```

### `core-dwh/.env`
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
ACADEMIC_URL=http://localhost:3000/api
LIBRARY_URL=http://localhost:4000/api/library
LABORATORIES_URL=http://localhost:3002/api/v1/files
PORT=3003
NODE_ENV=development
```

---

## Endpoints

### academic-record — `http://localhost:3000`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/estudiantes` | Listado de estudiantes |
| GET | `/api/asignaturas` | Listado de asignaturas |
| GET | `/api/cursos` | Listado de cursos |
| GET | `/api/matriculas` | Listado de matrículas |
| GET | `/api/calificaciones` | Listado de calificaciones |
| GET | `/health` | Health check |

### backend-library — `http://localhost:4000`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/library/` | Todos los documentos de biblioteca |
| GET | `/api/library/metricas` | Métricas globales por estudiante |
| GET | `/api/library/:numero_documento` | Documento de un estudiante |
| GET | `/health` | Health check |

### backend-laboratories — `http://localhost:3002`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/files/upload` | Sube un CSV a `/data/raw` |
| POST | `/api/v1/files/process` | Limpia y mueve `/raw` → `/clean` |
| GET | `/api/v1/files/raw` | Lista archivos en `/raw` |
| GET | `/api/v1/files/clean` | Retorna registros limpios como JSON |
| GET | `/health` | Health check |

### core-dwh — `http://localhost:3003`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/etl/dashboard` | Datos consolidados para el dashboard |
| POST | `/api/etl/run` | Ejecuta el proceso ETL completo |
| GET | `/health` | Health check |

---

## Estructura del proyecto

```
/
├── package.json                  ← Scripts raíz (dev, install:all)
├── academic-record/
│   └── src/
│       ├── app.ts
│       ├── config/database.ts
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── repositories/
│       └── routes/
├── backend-library/
│   └── src/
│       ├── app.ts
│       ├── config/mongo.ts
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── repositories/
│       └── routes/
├── backend-laboratories/
│   ├── data/
│   │   ├── raw/                  ← CSV sin procesar
│   │   ├── clean/                ← CSV limpio (JSON)
│   │   └── error/                ← CSV con errores
│   └── src/
│       ├── app.ts
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       └── services/
├── core-dwh/
│   └── src/
│       ├── app.ts
│       ├── config/database.ts
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/             ← Lógica ETL y queries analíticas
│       └── types/
└── dashboard-dwh/
    └── src/
        ├── App.tsx
        ├── components/
        │   └── charts/
        ├── store/
        └── types/
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js, Express 5, TypeScript |
| ORM / Drivers | pg (PostgreSQL), Mongoose (MongoDB) |
| Procesamiento CSV | csv-parse, multer |
| Orquestación | axios (llamadas entre servicios) |
| Frontend | React 19, Vite, TailwindCSS |
| Visualización | Recharts |
| Estado | Zustand |
| Monorepo | concurrently |
