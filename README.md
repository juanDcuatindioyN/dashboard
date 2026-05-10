# 📊 Academic Dashboard

Sistema de integración de datos académicos con arquitectura de microservicios.

## Arquitectura

```
academic-record   (puerto 3000)  ← PostgreSQL / Neon
backend-library   (puerto 4000)  ← MongoDB Atlas
backend-laboratories (puerto 3002) ← Archivos CSV
        ↓               ↓               ↓
              core-dwh (puerto 3003)
              Orquestador ETL + API BI
                        ↓
            dashboard-dwh (puerto 5173)
              React + Recharts
```

## 🚀 Cómo levantar todo

### Primera vez — instalar dependencias:
```bash
npm run install:all
```

### Levantar los 5 servicios con un solo comando:
```bash
npm run dev
```

## Variables de entorno

Cada servicio tiene su propio `.env`. Copia el `.env.example` de cada carpeta:

| Servicio | Variable clave |
|---|---|
| `academic-record/.env` | `DATABASE_URL` (PostgreSQL Neon) |
| `backend-library/.env` | `MONGODB_URI` (MongoDB Atlas) |
| `backend-laboratories/.env` | Solo `PORT=3002` |
| `core-dwh/.env` | `DATABASE_URL` + URLs de los microservicios |

## 📡 Endpoints

### academic-record — `http://localhost:3000/api`
| Método | Ruta |
|---|---|
| GET | `/api/estudiantes` |
| GET | `/api/asignaturas` |
| GET | `/api/cursos` |
| GET | `/api/matriculas` |
| GET | `/api/calificaciones` |

### backend-library — `http://localhost:4000/api/library`
| Método | Ruta |
|---|---|
| GET | `/api/library/` |
| GET | `/api/library/metricas` |
| GET | `/api/library/:numero_documento` |

### backend-laboratories — `http://localhost:3002/api/v1/files`
| Método | Ruta |
|---|---|
| GET | `/api/v1/files/raw` |
| GET | `/api/v1/files/clean` |
| POST | `/api/v1/files/upload` |
| POST | `/api/v1/files/process` |

### core-dwh — `http://localhost:3003/api/etl`
| Método | Ruta |
|---|---|
| GET | `/api/etl/dashboard` |
| POST | `/api/etl/run` |
