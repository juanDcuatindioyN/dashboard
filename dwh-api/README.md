# 📊 DWH API

Microservicio ETL que consolida los datos académicos y los expone al dashboard analítico.

## 🚀 Cómo levantar el proyecto

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia `.env.example` a `.env` y completa los valores:
   ```bash
   cp .env.example .env
   ```
   > Usa la misma `DATABASE_URL` que en `academic-record`.

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   El servidor corre en `http://localhost:3003`.

## 📡 Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check del servicio |
| `GET` | `/api/etl/dashboard` | Retorna los datos consolidados para el dashboard |
| `POST` | `/api/etl/run` | Ejecuta el proceso ETL |

### Respuesta de `/api/etl/dashboard`

```json
{
  "success": true,
  "data": {
    "subjectPerformance": [
      { "asignatura": "Matemáticas", "promedioNotas": 3.85 }
    ],
    "libraryImpact": [
      { "nivelActividad": "Alta", "promedioNotas": 4.2 }
    ],
    "laboratoryUsage": [
      { "equipo": "PC-01", "horasUso": 120 }
    ]
  }
}
```

## 🗄️ Tablas opcionales

- `subjectPerformance` se calcula con los datos reales de la DB.
- `libraryImpact` requiere la tabla `prestamo_biblioteca`. Si no existe, retorna datos de ejemplo.
- `laboratoryUsage` requiere la tabla `uso_laboratorio`. Si no existe, retorna datos de ejemplo.
