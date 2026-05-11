# Academic Dashboard — DWH

Sistema de integración y visualización de datos académicos de la Universidad Mariana.
Arquitectura de microservicios que consolida tres fuentes de datos heterogéneas en un
Data Warehouse analítico con esquema estrella.

> **Para el compañero que continúa:** lee `PENDIENTES.md` antes de empezar.

---

## Arquitectura

```
academic-record   :3000  ←  PostgreSQL / Neon (datos académicos OLTP)
backend-library   :4000  ←  MongoDB Atlas (biblioteca y recursos digitales)
backend-laboratories :3002 ← Archivos CSV (logs de laboratorios)
        ↓               ↓               ↓
              core-dwh  :3003
         Orquestador ETL + API BI
         Schema dwh en Neon (estrella)
                    ↓
        dashboard-dwh  :5173
         React + Recharts
```

---

## Inicio rápido

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

Esto crea los `.env` desde los `.env.example`. Luego edita cada uno con las credenciales reales
(pedirlas al compañero anterior):

| Archivo | Variable clave |
|---|---|
| `academic-record/.env` | `DATABASE_URL` — PostgreSQL Neon |
| `backend-library/.env` | `MONGODB_URI` — MongoDB Atlas (cadena directa, ver nota abajo) |
| `backend-laboratories/.env` | Solo `PORT=3002`, no necesita cambios |
| `core-dwh/.env` | `DATABASE_URL` + URLs de los 3 microservicios |

> ⚠️ **MongoDB:** usar cadena directa (sin `+srv`) por problemas de DNS SRV.
> El `.env.example` de `backend-library` ya tiene el formato correcto.

### 3. Levantar todo

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador.

### 4. Cargar el DWH (primera vez)

Una vez que todos los servicios estén corriendo, haz clic en
**"Sincronizar Data Warehouse"** en el dashboard, o ejecuta:

```bash
curl -X POST http://localhost:3003/api/etl/run
```

Esto extrae datos de las 3 fuentes, los cruza por cédula y los carga en el schema `dwh`.

---

## Scripts de utilidad

```bash
# Crear el schema dwh en Neon (solo primera vez)
node core-dwh/scripts/create-dwh.js

# Generar CSV de laboratorios con datos realistas
node core-dwh/scripts/generate-csv.js
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
| POST | `/api/v1/files/process` | Limpia `/raw` → `/clean` |
| GET | `/api/v1/files/raw` | Lista archivos en `/raw` |
| GET | `/api/v1/files/clean` | Retorna registros limpios como JSON |
| GET | `/health` | Health check |

### core-dwh — `http://localhost:3003`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/etl/dashboard` | Datos consolidados del DWH para el dashboard |
| POST | `/api/etl/run` | Ejecuta el ETL completo (extrae, transforma, carga) |
| GET | `/health` | Health check |

---

## Data Warehouse — Schema `dwh` en Neon

Esquema estrella dentro de la base de datos `neondb`:

```
Dimensiones:
  dwh.dim_estudiante      (135 registros)
  dwh.dim_asignatura      (40 registros)
  dwh.dim_tiempo          (335 fechas)
  dwh.dim_equipo_lab      (10 equipos)

Hechos:
  dwh.fact_academico          (notas + asistencia por matrícula)
  dwh.fact_uso_biblioteca     (préstamos y accesos a BD científicas)
  dwh.fact_uso_laboratorio    (599 registros de uso de equipos)
```

---

## Estructura del proyecto

```
/
├── package.json                  ← npm run dev / npm run install:all
├── setup.js                      ← Crea los .env desde los .env.example
├── PENDIENTES.md                 ← Lista de tareas para completar el trabajo
├── academic-record/              ← :3000 PostgreSQL
│   └── src/ config/ controllers/ middlewares/ models/ repositories/ routes/
├── backend-library/              ← :4000 MongoDB
│   └── src/ config/ controllers/ middlewares/ models/ repositories/ routes/
├── backend-laboratories/         ← :3002 CSV
│   ├── data/ raw/ clean/ error/
│   └── src/ controllers/ middlewares/ routes/ services/
├── core-dwh/                     ← :3003 ETL + API BI
│   ├── scripts/ create-dwh.js generate-csv.js
│   └── src/ config/ controllers/ middlewares/ repositories/ routes/ services/ types/
└── dashboard-dwh/                ← :5173 React + Recharts
    └── src/ components/ charts/ store/ types/
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js, Express 5, TypeScript |
| Bases de datos | PostgreSQL (Neon), MongoDB Atlas |
| ORM / Drivers | pg, Mongoose |
| ETL | axios (orquestación), csv-parse, multer |
| DWH | Schema estrella en PostgreSQL (schema `dwh`) |
| Frontend | React 19, Vite, TailwindCSS 4 |
| Visualización | Recharts |
| Estado | Zustand |
| Monorepo | concurrently |
