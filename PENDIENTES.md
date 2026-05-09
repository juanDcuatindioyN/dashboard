# 📋 Pendientes del Proyecto — Academic Dashboard

> Universidad Mariana 2026 · Arquitectura e Integración de Datos  
> Estado actual: **Puntos 1 parcial + 5 parcial completados**. Faltan puntos 1 (MongoDB), 2, 3 y completar el 4 y 5.

---

## ✅ Lo que ya está hecho

| Componente | Descripción |
|---|---|
| `backend/` | API Express + TypeScript conectada a PostgreSQL (Neon) |
| `backend/src/repositories/academic.repository.ts` | CRUD: estudiantes, asignaturas, cursos, matrículas, calificaciones |
| `backend/src/repositories/etl.repository.ts` | Queries analíticas: rendimiento por asignatura, correlación asistencia-notas, uso por asignatura |
| `backend/src/routes/academic.routes.ts` | `GET /api/academic/*` — 5 endpoints |
| `backend/src/routes/etl.routes.ts` | `GET /api/etl/dashboard`, `POST /api/etl/run` |
| `dashboard-dwh/` | Frontend React + Vite + Recharts + Zustand + TailwindCSS |
| Monorepo raíz | `npm run dev` levanta back + front con `concurrently` |

---

## ❌ Lo que falta implementar

### 1. Microservicio Biblioteca — MongoDB `[PRIORIDAD ALTA]`

**Qué es:** Conexión al cluster MongoDB (`umariana_db`) para extraer y aplanar los documentos de biblioteca.

**Credenciales disponibles:**
```
MONGODB_URI=mongodb+srv://nexo_user:neon123@nexocluster.wnzhkro.mongodb.net/umariana_db
```

**Archivos a crear en `backend/`:**

```
backend/src/config/mongo.ts              ← Conexión con mongoose
backend/src/models/biblioteca.model.ts  ← Schema Mongoose de la colección
backend/src/repositories/biblioteca.repository.ts  ← Consultas y aplanado de JSONs
backend/src/controllers/biblioteca.controller.ts
backend/src/routes/biblioteca.routes.ts  → GET /api/biblioteca
```

**Estructura del documento en MongoDB** (colección `umariana_db`):
```json
{
  "_id": ObjectId,
  "numero_documento": "1085500009",
  "nombre_estudiante": "CAMILO RODRIGUEZ VILLOTA",
  "metricas_globales": { ... },
  "historial_prestamos_fisicos": [ ... ],
  "accesos_bases_datos_cientificas": [ ... ],
  "descargas_material_estudio": [ ... ]
}
```

**Tarea:** Aplanar los arrays anidados y exponer un endpoint que retorne los datos listos para el ETL. Agregar `mongoose` al `backend/package.json`.

**Registrar la ruta en `backend/src/app.ts`:**
```ts
app.use('/api/biblioteca', bibliotecaRoutes);
```

**Agregar al `.env`:**
```
MONGODB_URI=mongodb+srv://nexo_user:neon123@nexocluster.wnzhkro.mongodb.net/umariana_db
```

---

### 2. Microservicio Ingestor CSV — Laboratorios `[PRIORIDAD ALTA]`

**Qué es:** Servicio que lee archivos CSV de laboratorios (logs de torniquetes y equipos), los limpia y estandariza.

**Estructura a crear (carpeta separada en la raíz):**

```
extractor-csv-laboratorios/
├── data/
│   ├── raw/      ← CSV sucio (zona de aterrizaje)
│   ├── clean/    ← CSV limpio y listo para cargar al DWH
│   └── error/    ← Archivos que fallaron la validación
├── src/
│   ├── app.ts
│   ├── controllers/csv.controller.ts   ← Endpoints para subir/descargar
│   ├── services/csv.service.ts         ← Lógica: leer raw, limpiar, mover a clean
│   └── routes/csv.routes.ts
└── package.json
```

**Columnas del CSV esperadas:**
```
id_estudiante, semestre, fecha, hora_entrada, hora_salida, equipo_utilizado
```

**Tareas de limpieza en `csv.service.ts`:**
- Normalizar `id_estudiante` (quitar espacios, ceros a la izquierda)
- Convertir fechas a formato `YYYY-MM-DD`
- Convertir horas a formato 24h (`HH:MM:SS`)
- Calcular `duracion_minutos = hora_salida - hora_entrada`
- Mover archivos procesados de `/raw` a `/clean`, fallidos a `/error`

**Endpoints:**
```
POST /api/csv/upload    ← Recibe CSV y lo guarda en /raw
POST /api/csv/process   ← Procesa /raw → /clean
GET  /api/csv/clean     ← Retorna los datos limpios como JSON
```

**Agregar al `package.json` raíz** el script para levantarlo con concurrently.

**Dependencias necesarias:** `multer`, `csv-parse`, `@types/multer`

---

### 3. Data Warehouse — Base de datos `umariana_dwh` en Neon `[PRIORIDAD ALTA]`

**Qué es:** Una segunda base de datos en la misma cuenta de Neon, con esquema estrella (OLAP), separada de la transaccional.

**Crear en Neon:** nueva base de datos llamada `umariana_dwh`.

**Tablas a crear (esquema estrella):**

```sql
-- Dimensiones
CREATE TABLE dim_estudiante (
  id_estudiante     VARCHAR PRIMARY KEY,
  tipo_documento    VARCHAR,
  nombres           VARCHAR,
  apellidos         VARCHAR,
  correo_institucional VARCHAR,
  semestre_actual   INTEGER,
  nivel_actividad_biblioteca VARCHAR  -- calculado desde MongoDB
);

CREATE TABLE dim_asignatura (
  codigo_asignatura VARCHAR PRIMARY KEY,
  nombre_asignatura VARCHAR,
  creditos          INTEGER,
  semestre_plan     INTEGER
);

CREATE TABLE dim_tiempo (
  id_fecha          DATE PRIMARY KEY,
  anio              INTEGER,
  mes               INTEGER,
  dia               INTEGER,
  dia_semana        VARCHAR,
  periodo_academico VARCHAR
);

CREATE TABLE dim_equipo_lab (
  id_equipo         SERIAL PRIMARY KEY,
  descripcion_equipo VARCHAR
);

-- Hechos
CREATE TABLE fact_academico (
  id_hecho          SERIAL PRIMARY KEY,
  id_estudiante     VARCHAR REFERENCES dim_estudiante,
  codigo_asignatura VARCHAR REFERENCES dim_asignatura,
  id_fecha          DATE    REFERENCES dim_tiempo,
  id_curso          INTEGER,
  docente_asignado  VARCHAR,
  asistio           BOOLEAN,
  nota_seguimiento_1 NUMERIC,
  nota_seguimiento_2 NUMERIC,
  nota_seguimiento_3 NUMERIC,
  nota_final        NUMERIC
);

CREATE TABLE fact_uso_biblioteca (
  id_hecho          SERIAL PRIMARY KEY,
  id_estudiante     VARCHAR REFERENCES dim_estudiante,
  id_fecha          DATE    REFERENCES dim_tiempo,
  tipo_interaccion  VARCHAR,  -- prestamo_fisico | acceso_bd | descarga
  recurso_id        VARCHAR,
  cantidad_articulos INTEGER,
  horas_lectura_acumuladas NUMERIC
);

CREATE TABLE fact_uso_laboratorio (
  id_hecho          SERIAL PRIMARY KEY,
  id_estudiante     VARCHAR REFERENCES dim_estudiante,
  id_equipo         INTEGER REFERENCES dim_equipo_lab,
  id_fecha          DATE    REFERENCES dim_tiempo,
  hora_entrada      TIME,
  hora_salida       TIME,
  duracion_minutos  INTEGER
);
```

**Agregar al `.env`:**
```
DWH_DATABASE_URL=postgresql://...@.../umariana_dwh?sslmode=require
```

---

### 4. Orquestador ETL / Loader `[PRIORIDAD ALTA]`

**Qué es:** El proceso que cruza los datos de las 3 fuentes (PostgreSQL, MongoDB, CSV) por `numero_documento` (cédula), los transforma y los carga en `umariana_dwh`.

**Archivos a crear en `backend/`:**

```
backend/src/config/dwh.ts                    ← Pool separado para umariana_dwh
backend/src/services/etl.service.ts          ← Lógica de transformación y cruce
backend/src/repositories/loader.repository.ts ← INSERT en tablas del DWH
backend/src/controllers/loader.controller.ts
backend/src/routes/loader.routes.ts          → POST /api/etl/run (ya existe, ampliar)
```

**Lógica en `etl.service.ts`:**
1. Extraer datos de PostgreSQL (academic.repository)
2. Extraer datos de MongoDB (biblioteca.repository)
3. Extraer datos del CSV limpio (llamada al extractor-csv o leer `/clean`)
4. Cruzar por `numero_documento`
5. Limpiar: normalizar IDs, fechas a `YYYY-MM-DD`, horas a formato 24h
6. Calcular variables agregadas: total horas laboratorio, nivel actividad biblioteca
7. Poblar dimensiones (`dim_*`) con upsert
8. Insertar en tablas de hechos (`fact_*`)

---

### 5. Dashboard — KPIs y gráficas cruzadas `[PRIORIDAD MEDIA]`

**Lo que falta en el frontend:**

**KPIs estratégicos** (tarjetas en la parte superior del dashboard):
- Promedio ponderado del programa (por créditos)
- % de estudiantes en riesgo (nota_final < 3.0)
- Tasa de utilización de recursos (estudiantes que usaron biblioteca o laboratorio / total)

**Nuevas gráficas de cruce de variables:**
- Dispersión: horas en laboratorio vs nota_final por estudiante
- Dispersión: nivel de actividad biblioteca vs promedio de notas
- Barras: comparación semestre a semestre

**Archivos a crear/modificar en `dashboard-dwh/`:**
```
dashboard-dwh/src/components/KpiCards.tsx          ← Tarjetas de KPIs
dashboard-dwh/src/components/charts/ScatterChart.tsx ← Horas lab vs notas
dashboard-dwh/src/types/dashboard.ts               ← Agregar tipos para KPIs
dashboard-dwh/src/store/useDashboardStore.ts        ← Agregar fetch de KPIs
```

**Nuevo endpoint necesario en backend:**
```
GET /api/etl/kpis  ← Retorna los 3 KPIs calculados desde umariana_dwh
```

---

## 🔧 Cambios menores pendientes

- [ ] Agregar capa `services/` en `backend/src/` entre controllers y repositories (requerido por la rúbrica — punto 4)
- [ ] Agregar `MONGODB_URI` y `DWH_DATABASE_URL` al `backend/.env.example`
- [ ] Actualizar `package.json` raíz para incluir `extractor-csv-laboratorios` en el script `dev`
- [ ] Agregar `mongoose` a `backend/package.json`
- [ ] Agregar `multer` y `csv-parse` a `extractor-csv-laboratorios/package.json`

---

## 📦 Variables de entorno finales (`backend/.env`)

```env
# PostgreSQL transaccional (ya configurado)
DATABASE_URL=postgresql://neondb_owner:...@.../neondb?sslmode=require

# MongoDB biblioteca
MONGODB_URI=mongodb+srv://nexo_user:neon123@nexocluster.wnzhkro.mongodb.net/umariana_db

# PostgreSQL DWH (nueva DB en Neon)
DWH_DATABASE_URL=postgresql://...@.../umariana_dwh?sslmode=require

PORT=3000
NODE_ENV=development
```

---

## 🗂️ Estructura final esperada del proyecto

```
/
├── package.json                          ← npm run dev (concurrently)
├── backend/
│   └── src/
│       ├── config/
│       │   ├── database.ts               ← Pool PostgreSQL transaccional ✅
│       │   ├── mongo.ts                  ← Conexión Mongoose ❌ FALTA
│       │   └── dwh.ts                    ← Pool PostgreSQL DWH ❌ FALTA
│       ├── models/
│       │   ├── academic.model.ts         ✅
│       │   └── biblioteca.model.ts       ← Schema Mongoose ❌ FALTA
│       ├── repositories/
│       │   ├── academic.repository.ts    ✅
│       │   ├── etl.repository.ts         ✅
│       │   ├── biblioteca.repository.ts  ❌ FALTA
│       │   └── loader.repository.ts      ← INSERT en DWH ❌ FALTA
│       ├── services/
│       │   └── etl.service.ts            ← Orquestador ETL ❌ FALTA
│       ├── controllers/
│       │   ├── academic.controller.ts    ✅
│       │   ├── etl.controller.ts         ✅
│       │   ├── biblioteca.controller.ts  ❌ FALTA
│       │   └── loader.controller.ts      ❌ FALTA
│       └── routes/
│           ├── academic.routes.ts        ✅
│           ├── etl.routes.ts             ✅
│           └── biblioteca.routes.ts      ❌ FALTA
├── extractor-csv-laboratorios/           ❌ FALTA (servicio completo)
│   ├── data/raw/
│   ├── data/clean/
│   ├── data/error/
│   └── src/
└── dashboard-dwh/
    └── src/
        ├── components/
        │   ├── KpiCards.tsx              ❌ FALTA
        │   └── charts/ScatterChart.tsx   ❌ FALTA
        └── store/useDashboardStore.ts    ← Ampliar con KPIs ❌ FALTA
```
