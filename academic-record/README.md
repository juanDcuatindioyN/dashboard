# 🎓 Academic Record Service

Bienvenido al servicio `academic-record`. Este microservicio se encarga de gestionar y extraer la información académica, interactuando con la base de datos de PostgreSQL.

## 🚀 Cómo levantar el proyecto

Sigue estos pasos para ejecutar el proyecto de manera local:

1. **Instalar dependencias:**
   Abre tu terminal en la raíz del servicio (`academic-record`) y ejecuta:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Asegúrate de contar con tu archivo `.env` configurado correctamente con las variables necesarias, como la cadena de conexión a la base de datos PostgreSQL en Neon.

3. **Ejecutar en modo desarrollo:**
   Una vez instaladas las dependencias, levanta el servidor con:
   ```bash
   npm run dev
   ```

## 📡 Endpoints Disponibles

Actualmente, el servicio expone los siguientes endpoints para consultar la información:

- 🧑‍🎓 **`GET /estudiantes`**: Obtiene el listado de todos los estudiantes.
- 📚 **`GET /asignaturas`**: Obtiene el listado de las asignaturas disponibles.
- 🏫 **`GET /cursos`**: Obtiene la información de los cursos.
- 📝 **`GET /matriculas`**: Obtiene el registro de las matrículas realizadas.
- 💯 **`GET /calificaciones`**: Obtiene las calificaciones de los estudiantes.

> **Nota:** Estos endpoints están expuestos bajo el enrutador principal del servicio. Asegúrate de incluir el prefijo correspondiente (ej. `/api`) si está configurado en `app.ts` o `server.ts`.
