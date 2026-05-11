# core-dwh

Orquestador ETL y API analitica del Data Warehouse academico.
Consume los tres microservicios extractores, transforma los datos y los carga
en el schema `umariana_dwh` de PostgreSQL.

## Puerto

`http://localhost:3003`

## Variables de entorno

```env
DATABASE_URL=postgresql://...          # Misma DB que academic-record
ACADEMIC_URL=http://localhost:3000/api
LIBRARY_URL=http://localhost:4000/api/library
LABORATORIES_URL=http://localhost:3002/api/v1/files
PORT=3003
NODE_ENV=development
```

## Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/etl/dashboard` | Datos consolidados del DWH para el dashboard |
| GET | `/api/etl/cruce` | Horas en laboratorio vs promedio de notas por estudiante |
| POST | `/api/etl/run` | Ejecuta el ETL completo |
| GET | `/health` | Health check |

## Scripts de utilidad

```bash
# Crear el schema umariana_dwh en Neon (solo primera vez)
node scripts/create-dwh.js

# Generar CSV de laboratorios con datos de ejemplo
node scripts/generate-csv.js
```

## Schema umariana_dwh — Modelo estrella

### Dimensiones
| Tabla | Descripcion |
|---|---|
| `dim_estudiante` | Datos demograficos + nivel actividad biblioteca |
| `dim_asignatura` | Catalogo de materias |
| `dim_tiempo` | Calendario con periodo academico |
| `dim_equipo_lab` | Equipos de computo del laboratorio |

### Hechos
| Tabla | Fuente | Descripcion |
|---|---|---|
| `fact_academico` | PostgreSQL | Notas y asistencia por matricula |
| `fact_uso_biblioteca` | MongoDB | Prestamos, accesos y descargas |
| `fact_uso_laboratorio` | CSV | Uso de equipos con duracion en minutos |

## Proceso ETL

El endpoint `POST /api/etl/run` ejecuta en orden:

1. Extraccion paralela de los 3 microservicios via axios
2. Carga de dimensiones con upsert (ON CONFLICT DO UPDATE)
3. Truncate de tablas de hechos (RESTART IDENTITY CASCADE)
4. Carga de hechos en batch usando UNNEST para rendimiento

Tiempo de ejecucion aproximado: 4 segundos para 135 estudiantes,
40 asignaturas, 599 registros de laboratorio y 25 de biblioteca.
