# Guion de Exposicion — Academic Dashboard DWH
## Universidad Mariana 2026 — Arquitectura e Integracion de Datos

---

# INTRODUCCION (cualquiera del grupo — 1 minuto)

"Buenos dias. Somos el grupo [nombre] y vamos a presentar nuestro proyecto de Data Warehouse
para la Oficina de Exito Academico de la Universidad Mariana.

El problema que resolvimos es el siguiente: la universidad genera grandes volumenes de datos
que viven en sistemas aislados. Los datos academicos estan en PostgreSQL, los datos de
biblioteca estan en MongoDB, y los registros de laboratorio son archivos CSV. Nadie los
habia cruzado antes.

Nuestro objetivo fue disenar un proceso ETL que integrara estas tres fuentes en un
Data Warehouse centralizado, y construir un dashboard analitico que permita tomar
decisiones basadas en datos reales."

---

# PERSONA 1 — Extraccion de Datos (5-7 minutos)

## Introduccion de la parte

"Yo me encargo de la capa de extraccion. Tenemos tres microservicios independientes,
cada uno conectado a una fuente de datos diferente."

## Microservicio 1 — academic-record (PostgreSQL)

"El primer microservicio se llama academic-record y corre en el puerto 3000.
Se conecta a nuestra base de datos relacional en Neon, que es PostgreSQL en la nube.

Esta base de datos tiene seis tablas: estudiante, asignatura, curso, matricula,
calificacion y asistencia. Son los datos transaccionales del sistema academico
de la universidad.

[Abrir en el navegador: http://localhost:3000/api/estudiantes]

Como pueden ver, el endpoint retorna los datos reales de los estudiantes en formato JSON.
Tenemos 135 estudiantes registrados con sus datos demograficos completos.

La arquitectura sigue el patron de capas: la ruta recibe la peticion, la pasa al
controlador, el controlador llama al servicio, el servicio llama al repositorio,
y el repositorio ejecuta la consulta SQL."

## Microservicio 2 — backend-library (MongoDB)

"El segundo microservicio se llama backend-library y corre en el puerto 4000.
Se conecta a MongoDB Atlas, que es nuestra base de datos no relacional en la nube.

Aqui guardamos datos semiestructurados de la biblioteca: historial de prestamos
fisicos, accesos a bases de datos cientificas como IEEE Xplore y Scopus,
y descargas de material de estudio.

[Abrir en el navegador: http://localhost:4000/api/library/]

Cada documento representa un estudiante y tiene arrays anidados con su actividad
en la biblioteca. Esto es lo que hace interesante MongoDB para este caso: la
estructura flexible permite guardar listas de longitud variable sin necesidad
de tablas adicionales."

## Microservicio 3 — backend-laboratories (CSV)

"El tercer microservicio se llama backend-laboratories y corre en el puerto 3002.
Este es diferente: no se conecta a una base de datos sino que procesa archivos CSV
exportados desde el software de control de acceso a los laboratorios.

[Mostrar el archivo en backend-laboratories/data/raw/laboratorios_2025_2026.csv]

Este es el archivo sucio tal como llega del sistema. Pueden ver los problemas:
- Los IDs tienen ceros a la izquierda: 01090000101
- Las fechas estan en formato DD/MM/YYYY: 14/01/2026
- Las horas estan en formato 12 horas con AM/PM: 2:39 PM
- Los nombres de equipos tienen espacios y estan en minuscula: pc-02

[Llamar POST http://localhost:3002/api/v1/files/process]

Despues del proceso de limpieza, el archivo queda asi:

[Mostrar backend-laboratories/data/clean/laboratorios_2025_2026.csv]

- ID normalizado: 1090000101 (sin ceros)
- Fecha en ISO: 2026-01-14
- Hora en 24h: 14:39:00
- Equipo estandarizado: PC-02
- Y se agrego una columna nueva: duracion_minutos, calculada automaticamente

Esto es lo que la rubrica llama Limpieza 1 y Limpieza 2."

---

# PERSONA 2 — ETL y Data Warehouse (6-8 minutos)

## Introduccion de la parte

"Yo me encargo del proceso ETL y del Data Warehouse.
ETL significa Extraccion, Transformacion y Carga.
Ya vimos la extraccion. Ahora voy a mostrar como transformamos y cargamos los datos."

## El orquestador — core-dwh

"El servicio core-dwh es el cerebro del sistema. Corre en el puerto 3003 y tiene
dos responsabilidades: ejecutar el ETL y exponer la API analitica para el dashboard.

Cuando se ejecuta el ETL, el core-dwh hace tres cosas en paralelo:
llama al academic-record para obtener los datos academicos,
llama al backend-library para obtener los datos de biblioteca,
y llama al backend-laboratories para obtener los registros de laboratorio ya limpios.

Luego cruza todos esos datos usando el numero de documento del estudiante como clave.
Eso es lo que la rubrica llama integridad: el cruce exacto por cedula."

## El Data Warehouse

"El Data Warehouse lo implementamos como un schema separado dentro de la misma
base de datos de Neon. El schema se llama umariana_dwh.

[Abrir Neon en el navegador, mostrar el schema umariana_dwh]

Tiene 7 tablas organizadas en un modelo estrella:

Cuatro dimensiones:
- dim_estudiante: datos demograficos mas el nivel de actividad en biblioteca
- dim_asignatura: catalogo de las 40 materias del programa
- dim_tiempo: calendario con periodo academico
- dim_equipo_lab: los 10 equipos de computo del laboratorio

Tres tablas de hechos:
- fact_academico: las notas y asistencia de cada matricula
- fact_uso_biblioteca: los prestamos y accesos de MongoDB
- fact_uso_laboratorio: los 599 registros de uso de equipos del CSV

El modelo estrella permite hacer consultas analiticas eficientes porque
las tablas de hechos se unen directamente con las dimensiones."

## Ejecutar el ETL en vivo

"Voy a ejecutar el ETL ahora mismo para que vean como funciona.

[Ejecutar: curl -X POST http://localhost:3003/api/etl/run]

[Mostrar la consola del core-dwh mientras corre]

Pueden ver en la consola:
- dim_tiempo: 335 fechas cargadas
- dim_asignatura: 40 materias
- dim_estudiante: 135 de PostgreSQL mas 15 de MongoDB
- dim_equipo_lab: 10 equipos
- fact_academico: 540 registros
- fact_uso_biblioteca: 25 registros
- fact_uso_laboratorio: 599 registros

Todo en aproximadamente 4 segundos gracias a que usamos inserts en batch
con la funcion UNNEST de PostgreSQL en lugar de insertar fila por fila."

---

# PERSONA 3 — Dashboard y Visualizacion (5-7 minutos)

## Introduccion de la parte

"Yo me encargo del dashboard analitico. Este es el producto final que consume
todos los datos del Data Warehouse y los presenta de forma visual para
que la Oficina de Exito Academico pueda tomar decisiones."

## KPIs

"[Abrir http://localhost:5173]

Lo primero que ven son cuatro indicadores clave:

Promedio general del programa: 3.68 sobre 5.0. Este numero se calcula
directamente desde el Data Warehouse como el promedio de todas las notas
de todos los estudiantes en todas las materias.

Total de estudiantes: 135 registrados en el DWH.

Estudiantes en riesgo: 87. Estos son los estudiantes cuyo promedio
esta por debajo de 3.5, que es el umbral de riesgo academico.

Tasa de utilizacion de recursos: 81%. Este indicador cruza los datos
de biblioteca y laboratorio para saber que porcentaje de estudiantes
esta usando los recursos universitarios."

## Grafica de rendimiento por asignatura

"Esta linea muestra el promedio de notas de las 36 asignaturas del programa,
ordenadas de mayor a menor. La linea amarilla punteada marca el umbral de
riesgo en 3.5.

Pueden ver que FISICA I tiene el mejor promedio con 4.07, y METODOS NUMERICOS
tiene el peor con 3.02. Hay varias materias por debajo del umbral de riesgo
que requieren atencion."

## Top y Bottom asignaturas

"Este grafico de barras horizontales compara directamente las 5 mejores
materias en azul contra las 5 peores en rojo. Es util para identificar
rapidamente donde hay que intervenir."

## Distribucion de notas

"Este grafico muestra cuantas asignaturas caen en cada rango de promedio.
La mayoria esta entre 3.5 y 4.0, que es un rango aceptable.
Hay algunas por debajo de 3.0 que son las mas criticas."

## Actividad en biblioteca

"Este grafico viene de los datos de MongoDB. Muestra cuantos estudiantes
tienen cada nivel de actividad en la biblioteca: Alta, Media, Baja o Sin actividad.
La mayoria no tiene actividad registrada, pero hay 15 estudiantes con datos
reales de prestamos y accesos a bases de datos cientificas."

## Grafica de dispersion

"Esta es la grafica mas importante para la Oficina de Exito Academico.
Cada punto es un estudiante. El eje horizontal muestra cuantas horas
paso en el laboratorio, y el eje vertical muestra su promedio de notas.

La linea amarilla marca el umbral de riesgo en 3.5.

Lo que podemos observar es que no hay una correlacion perfecta entre
horas en laboratorio y notas, lo que sugiere que el tiempo en laboratorio
no es el unico factor determinante del rendimiento academico."

## Sincronizacion

"Por ultimo, el boton Sincronizar Data Warehouse ejecuta el ETL completo
y actualiza todos los datos en tiempo real. Tarda aproximadamente 4 segundos.

[Hacer clic en el boton y mostrar el toast de confirmacion]"

---

# CIERRE (cualquiera del grupo — 1 minuto)

"Para resumir, construimos un sistema completo de integracion de datos que:

Primero, extrae datos de tres fuentes heterogeneas: PostgreSQL, MongoDB y CSV.

Segundo, los transforma y limpia: normaliza IDs, convierte fechas a formato ISO,
convierte horas a formato 24h, calcula duraciones y cruza todo por cedula.

Tercero, los carga en un Data Warehouse con modelo estrella que permite
consultas analiticas eficientes.

Y cuarto, los visualiza en un dashboard con KPIs reales y graficas que
cruzan las tres fuentes de datos.

El codigo esta disponible en GitHub y toda la arquitectura esta documentada
en el archivo ARQUITECTURA.md del repositorio.

Quedamos atentos a sus preguntas."

---

# PREGUNTAS FRECUENTES

**Por que usaron MongoDB para la biblioteca?**
Porque los datos de biblioteca son semiestructurados: cada estudiante puede tener
cero o muchos prestamos, cero o muchos accesos. En una base relacional necesitariamos
tablas adicionales con joins complejos. MongoDB permite guardar esos arrays directamente
en el documento del estudiante.

**Por que el DWH esta en el mismo servidor que la base transaccional?**
Por simplicidad y costo. Usamos un schema separado llamado umariana_dwh dentro de
la misma instancia de Neon. En produccion lo ideal seria una instancia separada,
pero para este proyecto el schema separado cumple el mismo proposito de aislamiento.

**Como garantizan la integridad del cruce de datos?**
Usamos el numero de documento como clave de cruce en todas las fuentes.
Antes de insertar en las tablas de hechos, normalizamos los IDs eliminando
ceros a la izquierda y espacios. Si un estudiante de MongoDB no existe en
PostgreSQL, lo insertamos en dim_estudiante de todas formas para no perder
sus datos de biblioteca.

**Que pasa si una fuente de datos no esta disponible cuando corre el ETL?**
El orquestador usa Promise.allSettled con fallback a array vacio. Si MongoDB
no responde, el ETL continua con los datos de PostgreSQL y CSV. El reporte
final indica que fuentes fallaron.

**Por que el CSV de laboratorios tiene datos generados y no reales?**
No teniamos acceso al sistema de control de acceso de los laboratorios.
Generamos datos de ejemplo con los IDs reales de los estudiantes de la base
de datos para demostrar que el proceso de limpieza funciona correctamente
con cualquier CSV que tenga ese formato.
