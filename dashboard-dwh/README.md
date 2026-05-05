# Dashboard Analítico DWH

Este es el frontend del sistema Data Warehouse (DWH) de la Universidad Mariana. Es una aplicación React construida con Vite, diseñada para presentar de manera visual y analítica los datos consolidados provenientes de los microservicios académicos, de biblioteca y de laboratorios. 

La aplicación permite visualizar gráficas de rendimiento e impacto, y también cuenta con la funcionalidad de **ejecutar la sincronización (ETL)** de datos directamente desde la interfaz, comunicándose con el microservicio `core-dwh`.

## 🚀 Cómo levantar el proyecto

Asegúrate de tener Node.js instalado. Luego, sigue estos pasos desde la terminal:

### 1. Navegar al directorio del frontend
```bash
cd dashboard-dwh
```

### 2. Instalar las dependencias
```bash
npm install
```

### 3. Ejecutar el servidor en modo desarrollo
```bash
npm run dev
```

Esto iniciará la aplicación (usualmente en `http://localhost:5173`). 

> **Nota:** Para que el dashboard muestre datos y el proceso de sincronización funcione, el backend principal (`core-dwh`) debe estar corriendo simultáneamente en el puerto `3003`.
