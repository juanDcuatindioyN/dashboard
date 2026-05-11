# Academic Dashboard — DWH

Sistema de integracion y visualizacion de datos academicos de la Universidad Mariana.
Arquitectura de microservicios que consolida tres fuentes de datos heterogeneas en un
Data Warehouse analitico con esquema estrella.

---

## Arquitectura

```
academic-record   :3000  ←  PostgreSQL / Neon  (datos academicos OLTP)
backend-library   :4000  ←  MongoDB Atlas      (biblioteca y recursos digitales)
backend-laboratories :3002 ← Archivos CSV      (logs de laboratorios)
        |               |               |
        +---------------+---------------+
                        |
                 core-dwh  :3003
          Orquestador ETL + API BI
          Schema umariana_dwh en Neon
                        |
            dashboard-dwh  :5173
             React + Recharts
```

---

## Inicio rapido

### 1. Clonar e instalar

```bash
git clone https://github.com/juanDcuatindioyN/dashboard.git
cd dashboard
npm run install:all
```

### 2. Configurar variables de entorno

```bash
node setup.js
```

Edita cada `.env` con las credenciales reales:

| Archivo | Variable clave |
|---|---|
| `academic-record/.env` | `DATABASE_URL` — PostgreSQL Neon |
| `backend-library/.env` | `MONGODB_URI` — MongoDB Atlas (cadena directa sin SRV) |
| `backend-laboratories/.env` | Solo `PORT=3002`, no necesita cambios |
| `core-dwh/.env` | `DATABASE_URL` + URLs de los 3 microservicios |

### 3. Levantar todo

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador.

### 4. Cargar el DWH (primera vez o para actualizar)

Haz clic en **Sincronizar Data Warehouse** en el dashboard, o ejecuta:

```bash
curl -X POST http://localhost:3003/api/etl/run
```

El proceso tarda aproximadamente 4 segundos.

---

## Endpoints

### academic-record — `http://localhost:3000`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/estudiantes` | Listado de estudiantes |
| GET | `/api/asignaturas` | Listado de asignaturas |
| GET | `/api/cursos` | Listado de cursos |
| GET | `/api/matriculas` | Listado de matriculas |
| GET | `/api/calificaciones` | Calificaciones con promedio calculado |
| GET | `/health` | Health check |

### backend-library — `http://localhost:4000`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/library/` | Todos los documentos de biblioteca |
| GET | `/api/library/metricas` | Metricas globales por estudiante |
| GET | `/api/library/:numero_documento` | Documento de un estudiante |
| GET | `/health` | Health check |

### backend-laboratories — `http://localhost:3002`
| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/api/v1/files/upload` | Sube un CSV a `/data/raw` |
| POST | `/api/v1/files/process` | Limpia `/raw` y guarda en `/clean` |
| GET | `/api/v1/files/raw` | Lista archivos en `/raw` |
| GET | `/api/v1/files/clean` | Retorna registros limpios como JSON |
| GET | `/health` | Health check |

### core-dwh — `http://localhost:3003`
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/etl/dashboard` | Datos consolidados del DWH |
| GET | `/api/etl/cruce` | Horas laboratorio vs notas por estudiante |
| POST | `/api/etl/run` | Ejecuta el ETL completo |
| GET | `/health` | Health check |

---

## Data Warehouse — Schema `umariana_dwh` en Neon

Esquema estrella dentro de la base de datos `neondb`:

```
Dimensiones:
  umariana_dwh.dim_estudiante      (135 registros)
  umariana_dwh.dim_asignatura      (40 registros)
  umariana_dwh.dim_tiempo          (335 fechas)
  umariana_dwh.dim_equipo_lab      (10 equipos)

Hechos:
  umariana_dwh.fact_academico          (notas + asistencia)
  umariana_dwh.fact_uso_biblioteca     (prestamos y accesos MongoDB)
  umariana_dwh.fact_uso_laboratorio    (599 registros de uso de equipos)
```

---

## Estructura del proyecto

```
/
├── package.json                     ← npm run dev / npm run install:all
├── setup.js                         ← Crea los .env desde los .env.example
├── README.md
├── ARQUITECTURA.md                  ← Documentacion tecnica para la exposicion
├── academic-record/                 ← :3000 PostgreSQL
│   └── src/
│       ├── config/       database.ts
│       ├── controllers/  academic.controller.ts
│       ├── middlewares/  errorHandler.ts
│       ├── models/       academic.model.ts
│       ├── repositories/ academic.repository.ts
│       ├── routes/       academic.routes.ts
│       └── services/     academic.service.ts
├── backend-library/                 ← :4000 MongoDB
│   └── src/
│       ├── config/       mongo.ts
│       ├── controllers/  biblioteca.controller.ts
│       ├── middlewares/  errorHandler.ts
│       ├── models/       biblioteca.model.ts
│       ├── repositories/ biblioteca.repository.ts
│       ├── routes/       biblioteca.routes.ts
│       └── services/     biblioteca.service.ts
├── backend-laboratories/            ← :3002 CSV
│   ├── data/
│   │   ├── raw/          ← CSV sucio (zona de aterrizaje)
│   │   ├── clean/        ← CSV limpio y estandarizado
│   │   └── error/        ← CSV con errores de validacion
│   └── src/
│       ├── controllers/  csv.controller.ts
│       ├── middlewares/  errorHandler.ts
│       ├── routes/       csv.routes.ts
│       └── services/     csv.service.ts
├── core-dwh/                        ← :3003 ETL + API BI
│   ├── scripts/
│   │   ├── create-dwh.js    ← Crea el schema umariana_dwh
│   │   └── generate-csv.js  ← Genera CSV de ejemplo
│   └── src/
│       ├── config/       database.ts, dwh.ts
│       ├── controllers/  etl.controller.ts
│       ├── middlewares/  errorHandler.ts
│       ├── repositories/ dwh.repository.ts
│       ├── routes/       etl.routes.ts
│       ├── services/     etl.service.ts, loader.service.ts
│       └── types/        dashboard.ts
└── dashboard-dwh/                   ← :5173 React + Recharts
    └── src/
        ├── components/
        │   ├── DashboardView.tsx
        │   ├── KpiCards.tsx
        │   ├── Layout.tsx
        │   ├── SyncButton.tsx
        │   └── charts/
        │       ├── GradeDistributionChart.tsx
        │       ├── LibraryActivityChart.tsx
        │       ├── ScatterLabNotasChart.tsx
        │       ├── SubjectPerformanceChart.tsx
        │       └── TopSubjectsChart.tsx
        ├── store/        useDashboardStore.ts
        └── types/        dashboard.ts
```

---

## Stack tecnologico

| Capa | Tecnologia |
|---|---|
| Backend | Node.js, Express 5, TypeScript |
| Bases de datos | PostgreSQL (Neon), MongoDB Atlas |
| ORM / Drivers | pg, Mongoose |
| ETL | axios, csv-parse, multer |
| DWH | Schema estrella en PostgreSQL (umariana_dwh) |
| Frontend | React 19, Vite, TailwindCSS 4 |
| Visualizacion | Recharts |
| Estado | Zustand |
| Monorepo | concurrently |
