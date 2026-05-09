# 🖥️ Backend

Servidor unificado que expone los datos académicos y las analíticas del dashboard.

## Estructura

```
src/
├── app.ts                        ← Entry point (puerto 3000)
├── config/
│   └── database.ts               ← Pool de conexión PostgreSQL
├── middlewares/
│   └── errorHandler.ts           ← Manejo centralizado de errores
├── models/
│   └── academic.model.ts         ← Interfaces de los modelos de datos
├── types/
│   └── dashboard.ts              ← Interfaces del dashboard analítico
├── repositories/
│   ├── academic.repository.ts    ← Queries CRUD
│   └── etl.repository.ts         ← Queries analíticas (ETL)
├── controllers/
│   ├── academic.controller.ts
│   └── etl.controller.ts
└── routes/
    ├── academic.routes.ts
    └── etl.routes.ts
```

## 🚀 Cómo levantar

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   # Edita .env con tu DATABASE_URL de Neon
   ```

3. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```
   Servidor disponible en `http://localhost:3000`

## 📡 Endpoints

### Datos académicos — `/api/academic`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/academic/estudiantes` | Listado de estudiantes |
| GET | `/api/academic/asignaturas` | Listado de asignaturas |
| GET | `/api/academic/cursos` | Listado de cursos |
| GET | `/api/academic/matriculas` | Listado de matrículas |
| GET | `/api/academic/calificaciones` | Listado de calificaciones |

### Dashboard analítico — `/api/etl`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/etl/dashboard` | Datos consolidados para el dashboard |
| POST | `/api/etl/run` | Ejecuta el proceso ETL |
| GET | `/health` | Health check del servicio |
