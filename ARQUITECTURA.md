# Arquitectura e Integración de Datos — Universidad Mariana 2026
## Programa de Ingeniería de Sistemas

---

## Contexto del problema

La Universidad Mariana gestiona datos académicos en sistemas aislados: un sistema transaccional
en PostgreSQL para registros académicos, una base de datos documental en MongoDB para la
biblioteca, y archivos CSV exportados desde los torniquetes y software de laboratorios.

El objetivo de este proyecto es diseñar e implementar un proceso ETL que integre estas tres
fuentes heterogéneas en un Data Warehouse centralizado, y exponer los datos consolidados
a través de un dashboard analítico.

---

## Fuentes de datos

### 1. Sistema de Registro Academico — PostgreSQL (Neon)

Base de datos relacional que representa el sistema transaccional (OLTP) de la universidad.
Contiene datos fuertemente estructurados organizados en seis tablas:

- `estudiante` — datos demograficos: documento, nombres, apellidos, correo, semestre
- `asignatura` — catalogo de materias con codigo, nombre, creditos y semestre del plan
- `curso` — instancias de asignatura por periodo con docente asignado
- `matricula` — relacion entre estudiante y curso
- `calificacion` — notas parciales (seguimiento 1, 2, 3) y nota final por matricula
- `asistencia` — registro booleano de asistencia por matricula y fecha

### 2. Sistema de Biblioteca — MongoDB Atlas

Base de datos documental que almacena datos semiestructurados con arrays anidados.
Cada documento representa un estudiante e incluye:

- `metricas_globales` — totales de prestamos, accesos y descargas
- `historial_prestamos_fisicos` — array de prestamos de libros fisicos
- `accesos_bases_datos_cientificas` — array de accesos a bases cientificas
- `descargas_material_estudio` — array de descargas de material

La clave de cruce con PostgreSQL es el campo `numero_documento`.

### 3. Sistema de Laboratorios — Archivos CSV

Logs planos exportados desde el software de gestion de laboratorios. Cada registro contiene:
`id_estudiante`, `semestre`, `fecha`, `hora_entrada`, `hora_salida`, `equipo_utilizado`.

---

## Arquitectura de microservicios

El sistema esta compuesto por cinco servicios independientes que se comunican via HTTP:

```
academic-record   (puerto 3000)   PostgreSQL
backend-library   (puerto 4000)   MongoDB
backend-laboratories (puerto 3002) CSV
          |               |              |
          +---------------+--------------+
                          |
                     core-dwh (puerto 3003)
                     Orquestador ETL
                          |
                   dashboard-dwh (puerto 5173)
                   Frontend React
```

Cada microservicio sigue el patron de capas:

```
routes  ->  controllers  ->  services  ->  repositories  ->  base de datos
```

- `routes` — define los endpoints HTTP y delega al controlador
- `controllers` — recibe el request, llama al servicio, devuelve el response
- `services` — contiene la logica de negocio y transformacion
- `repositories` — ejecuta las consultas a la base de datos
- `config` — conexion a la base de datos con validacion de variables de entorno

---

## Proceso ETL

El proceso ETL es ejecutado por `core-dwh` al recibir una peticion `POST /api/etl/run`.
Se divide en tres fases:

### Fase 1 — Extraccion

El orquestador consume asincrónicamente las APIs de los tres microservicios extractores:

- `GET http://localhost:3000/api/calificaciones` — notas desde PostgreSQL
- `GET http://localhost:4000/api/library` — documentos de biblioteca desde MongoDB
- `GET http://localhost:3002/api/v1/files/clean` — registros de laboratorio desde CSV limpio

### Fase 2 — Transformacion y limpieza

Antes de cargar al DWH se aplican las siguientes transformaciones:

- Normalizacion de IDs: se eliminan espacios y ceros a la izquierda del numero de documento
- Normalizacion de fechas: conversion a formato `YYYY-MM-DD` desde cualquier formato de entrada
- Normalizacion de horas: conversion a formato 24h (`HH:MM:SS`)
- Calculo de duracion: `duracion_minutos = hora_salida - hora_entrada`
- Calculo de nivel de actividad biblioteca: clasificacion del estudiante en
  `Sin actividad`, `Baja`, `Media` o `Alta` segun el total de interacciones en MongoDB
- Cruce de datos: todas las fuentes se unen por `numero_documento` (cedula del estudiante)

### Fase 3 — Carga al Data Warehouse

Los datos transformados se cargan en el schema `dwh` dentro de la misma base de datos
PostgreSQL usando la estrategia upsert para dimensiones y truncate-reload para hechos.

---

## Data Warehouse — Esquema estrella

El DWH esta implementado como un schema separado (`dwh`) dentro de la base de datos `neondb`.
Sigue el modelo dimensional con tablas de hechos y dimensiones:

### Dimensiones

| Tabla | Descripcion | Registros |
|---|---|---|
| `dim_estudiante` | Datos demograficos + nivel actividad biblioteca | 135 |
| `dim_asignatura` | Catalogo de materias | 40 |
| `dim_tiempo` | Calendario con periodo academico | 335 |
| `dim_equipo_lab` | Equipos de computo del laboratorio | 10 |

### Hechos

| Tabla | Descripcion | Fuente |
|---|---|---|
| `fact_academico` | Notas y asistencia por matricula | PostgreSQL |
| `fact_uso_biblioteca` | Prestamos y accesos por estudiante | MongoDB |
| `fact_uso_laboratorio` | Uso de equipos por estudiante | CSV |

Las tablas de hechos se relacionan con las dimensiones a traves de claves foraneas,
permitiendo analisis multidimensional (OLAP).

---

## API analitica

El endpoint `GET /api/etl/dashboard` consulta directamente el schema `dwh` y retorna:

```json
{
  "success": true,
  "data": {
    "subjectPerformance": [
      { "asignatura": "FISICA I", "promedioNotas": 4.07 }
    ],
    "laboratoryUsage": [
      { "equipo": "PC-07", "horasUso": 8146 }
    ],
    "libraryImpact": [
      { "nivelActividad": "Alta", "promedioNotas": 3.85 }
    ],
    "kpis": {
      "promedioGeneral": 3.68,
      "totalEstudiantes": 135,
      "estudiantesEnRiesgo": 87,
      "tasaUtilizacionRecursos": 81
    }
  }
}
```

---

## Dashboard

El frontend consume exclusivamente el endpoint `GET /api/etl/dashboard` del `core-dwh`.
Utiliza Zustand para el manejo de estado y Recharts para las visualizaciones.

Visualizaciones implementadas:

- Tarjetas KPI: promedio general del programa, total de estudiantes, estudiantes en riesgo
  (promedio menor a 3.5) y tasa de utilizacion de recursos universitarios
- Linea de rendimiento: promedio de notas de las 36 asignaturas ordenadas de mayor a menor,
  con linea de referencia en 3.5 (umbral de riesgo)
- Barras horizontales: comparativa Top 5 mejores vs Bottom 5 peores asignaturas
- Distribucion de notas: cantidad de asignaturas por rango (menor a 3.0, 3.0-3.5, 3.5-4.0,
  4.0-4.5, mayor a 4.5)

El boton "Sincronizar Data Warehouse" ejecuta el ETL completo y refresca los datos.

---

## Flujo completo de una sincronizacion

1. El usuario hace clic en "Sincronizar Data Warehouse" en el dashboard
2. El frontend envia `POST http://localhost:3003/api/etl/run`
3. `core-dwh` extrae datos de los tres microservicios en paralelo
4. Se aplican las transformaciones y limpiezas descritas
5. Se cargan las dimensiones con upsert (no duplica registros)
6. Se truncan y recargan las tablas de hechos
7. El frontend llama automaticamente a `GET /api/etl/dashboard`
8. Los datos del DWH se muestran en el dashboard

---

## Tecnologias utilizadas

| Componente | Tecnologia |
|---|---|
| Lenguaje backend | TypeScript sobre Node.js |
| Framework HTTP | Express 5 |
| Base de datos relacional | PostgreSQL en Neon (cloud) |
| Base de datos documental | MongoDB Atlas (cloud) |
| Driver PostgreSQL | pg (node-postgres) |
| ODM MongoDB | Mongoose |
| Procesamiento CSV | csv-parse, multer |
| Orquestacion HTTP | axios |
| Frontend | React 19 con Vite |
| Estilos | TailwindCSS 4 |
| Graficas | Recharts |
| Estado frontend | Zustand |
| Monorepo | concurrently |
