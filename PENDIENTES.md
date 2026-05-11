# 📋 Pendientes — Entrega Final

> Estado al 11 de mayo de 2026. El proyecto está funcional al ~70%.
> Este documento es para el compañero que continúa el desarrollo.

---

## ✅ Lo que ya está implementado

### Infraestructura
- Monorepo con 5 servicios, un solo `npm run dev` los levanta todos
- Variables de entorno configuradas en cada servicio

### Microservicio `academic-record` (puerto 3000)
- Conexión a PostgreSQL (Neon) funcionando
- Endpoints: `/api/estudiantes`, `/api/asignaturas`, `/api/cursos`, `/api/matriculas`, `/api/calificaciones`

### Microservicio `backend-library` (puerto 4000)
- Conexión a MongoDB Atlas funcionando (cadena directa sin SRV)
- Endpoints: `/api/library/`, `/api/library/metricas`, `/api/library/:numero_documento`

### Microservicio `backend-laboratories` (puerto 3002)
- Endpoints: `/api/v1/files/upload`, `/api/v1/files/process`, `/api/v1/files/clean`
- CSV de 599 registros generado y procesado en `/data/clean/`
- Limpieza: normalización de IDs, fechas YYYY-MM-DD, horas 24h, cálculo de duración

### `core-dwh` (puerto 3003) — Orquestador ETL
- Schema `dwh` creado en Neon con 7 tablas (esquema estrella)
- ETL completo: extrae de las 3 fuentes, cruza por cédula, carga en DWH
- Endpoints: `GET /api/etl/dashboard`, `POST /api/etl/run`
- KPIs reales desde el DWH: promedio general, estudiantes en riesgo, tasa de utilización

### `dashboard-dwh` (puerto 5173)
- 4 KPI cards con datos reales del DWH
- Gráfica de rendimiento por asignatura (36 materias)
- Top 5 mejores y peores asignaturas
- Distribución de notas por rangos

---

## ❌ Lo que falta (ordenado por impacto en la nota)

### 1. `libraryImpact` solo tiene un nivel — CRÍTICO
**Problema:** La query de correlación asistencia-notas solo retorna `"Sin actividad"` porque
todos los estudiantes en MongoDB tienen `metricas_globales` con valores en 0 (datos vacíos).

**Solución:** Revisar la colección en MongoDB Compass. Si los arrays
`historial_prestamos_fisicos`, `accesos_bases_datos_cientificas` y `descargas_material_estudio`
están vacíos, hay que poblarlos con datos reales o de ejemplo.

**Archivo a modificar:** `core-dwh/src/services/loader.service.ts` → función `loadDimEstudiante()`
El cálculo del `nivel_actividad_biblioteca` depende de que esos arrays tengan datos.

---

### 2. Gráfica de cruce de variables — FALTA (rúbrica punto 5)
**Qué pide la rúbrica:** "Visualizaciones de dispersión que mapeen el esfuerzo del estudiante
(horas en campus/laboratorio) contra sus resultados evaluativos reales."

**Qué hay que hacer:**
- Agregar endpoint `GET /api/etl/cruce` en `core-dwh` que retorne por estudiante:
  `{ id_estudiante, total_minutos_lab, promedio_notas }`
- Crear componente `ScatterPlotChart.tsx` en `dashboard-dwh/src/components/charts/`
- Agregarlo al `DashboardView.tsx`

**Query SQL para el endpoint:**
```sql
SELECT
  f.id_estudiante,
  SUM(l.duracion_minutos) AS total_minutos_lab,
  AVG((f.nota_seguimiento_1 + f.nota_seguimiento_2 + f.nota_seguimiento_3 + f.nota_final) / 4.0) AS promedio_notas
FROM dwh.fact_academico f
LEFT JOIN dwh.fact_uso_laboratorio l ON f.id_estudiante = l.id_estudiante
GROUP BY f.id_estudiante
```

---

### 3. Capa `services/` en `academic-record` y `backend-library` — FALTA (rúbrica punto 4)
**Qué pide la rúbrica:** "Patrón de capas estricto (Controllers, Services, Repositories)"

Actualmente `academic-record` y `backend-library` van directo de controller a repository,
sin capa de servicio intermedia.

**Qué hay que hacer:** Crear `src/services/academic.service.ts` y `src/services/biblioteca.service.ts`
que encapsulen la lógica de negocio entre el controller y el repository.

---

### 4. Zonas `/raw`, `/clean`, `/error` en el repo — FALTA (rúbrica punto 4)
Los directorios `backend-laboratories/data/` están en `.gitignore`.
Hay que agregar un `.gitkeep` en cada carpeta para que aparezcan en el repo.

```bash
New-Item backend-laboratories/data/raw/.gitkeep
New-Item backend-laboratories/data/clean/.gitkeep
New-Item backend-laboratories/data/error/.gitkeep
```

---

### 5. README del `core-dwh` — FALTA
Documentar el proceso ETL, las tablas del DWH y cómo ejecutar los scripts.

---

## 🗄️ Tablas del DWH (schema `dwh` en `neondb`)

```
dwh.dim_estudiante      — 135 registros
dwh.dim_asignatura      — 40 registros
dwh.dim_tiempo          — 335 fechas
dwh.dim_equipo_lab      — 10 equipos (PC-01 a PC-10)
dwh.fact_academico      — registros de notas y asistencia
dwh.fact_uso_biblioteca — registros de préstamos y accesos
dwh.fact_uso_laboratorio — 599 registros de uso de equipos
```

---

## 🔑 Credenciales (NO subir al repo)

Están en los `.env` de cada servicio. Pedir al compañero anterior.

- `academic-record/.env` → `DATABASE_URL` (PostgreSQL Neon)
- `backend-library/.env` → `MONGODB_URI` (MongoDB Atlas, cadena directa sin SRV)
- `core-dwh/.env` → `DATABASE_URL` + URLs de los microservicios

---

## 📊 Estado actual del dashboard

| KPI | Valor actual |
|---|---|
| Promedio general | 3.68 / 5.0 |
| Total estudiantes | 135 |
| Estudiantes en riesgo | 87 (promedio < 3.5) |
| Tasa utilización recursos | 81% |
| Asignaturas con mejor nota | FISICA I (4.07) |
| Asignaturas con peor nota | METODOS NUMERICOS (3.02) |
