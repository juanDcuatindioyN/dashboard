# 🚀 Tutorial: Construyendo un Dashboard con React y Recharts

¡Bienvenidos! En esta guía aprenderemos a construir un Dashboard analítico desde cero. Nuestro objetivo es conectarnos a una API, obtener datos y graficarlos de forma hermosa y responsiva.

## 🛠️ 1. Librerías Clave que Usaremos

Para no reinventar la rueda, usaremos el siguiente "Stack" (conjunto de herramientas):

*   **Vite + React + TypeScript:** La base de nuestro proyecto. Vite lo hace rapidísimo y TypeScript nos ayuda a evitar errores tipando nuestros datos.
*   **Tailwind CSS:** Para diseñar de manera ágil usando clases (ej. `bg-blue-500 text-white`).
*   **Zustand:** Un gestor de estado global súper ligero. Nos servirá para guardar los datos que traemos de la API y compartirlos entre cualquier componente sin problemas.
*   **Recharts:** ¡La estrella del show! Una librería construida sobre React para hacer gráficos asombrosos sin esfuerzo.

---

## 🏗️ 2. Paso a Paso: Creación y Configuración

### Paso A: Inicializar el proyecto
Abre tu terminal y ejecuta:
```bash
npx create-vite@latest mi-dashboard --template react-ts
cd mi-dashboard
npm install
```

### Paso B: Instalar dependencias extra
Necesitaremos instalar nuestras herramientas gráficas y de utilidades:
```bash
npm install recharts zustand axios tailwindcss @tailwindcss/vite
```

### Paso C: Configurar Tailwind CSS
En Vite, configurar Tailwind es muy fácil. 
1. Edita el archivo `vite.config.ts` y agrega el plugin de tailwind:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
})
```
2. Limpia el archivo `src/index.css` y pon solo esto:
```css
@import "tailwindcss";
```

---

## 📊 3. ¿Qué es Recharts?

**Recharts** es una librería de visualización de datos construida específicamente para React. 
En lugar de lidiar con matemáticas complejas o Canvas directamente, Recharts te permite crear gráficos usando **Componentes de React**. Es decir, si sabes usar etiquetas `<MiComponente>`, sabes usar Recharts.

### 💡 Ejemplo Práctico: Un Gráfico de Barras Simple

Imagina que tenemos un arreglo de datos con las notas de los estudiantes. Así es como crearíamos un componente con Recharts:

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// 1. Nuestra data
const datos = [
  { nombre: 'Juan', nota: 4.5 },
  { nombre: 'María', nota: 3.8 },
  { nombre: 'Pedro', nota: 4.9 },
];

export const GraficoNotas = () => {
  return (
    // ResponsiveContainer hace que el gráfico se adapte a cualquier pantalla
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        {/* El gráfico principal pasándole la data */}
        <BarChart data={datos}>
          
          {/* Ejes X y Y */}
          <XAxis dataKey="nombre" /> 
          <YAxis />
          
          {/* Tooltip: la cajita de información al pasar el mouse */}
          <Tooltip />
          
          {/* Las barras, definiendo qué propiedad graficar */}
          <Bar dataKey="nota" fill="#3b82f6" />
          
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
```

**¿Qué pasó aquí?**
1. Le pasamos un `Array` de objetos al `BarChart`.
2. Le dijimos al `XAxis` que use la propiedad `nombre` para los textos de abajo.
3. Le dijimos a la `Bar` que grafique la propiedad `nota` y la pinte de color azul (`#3b82f6`).

¡Así de simple! Si quisieras un gráfico de líneas, solo cambias `<BarChart>` y `<Bar>` por `<LineChart>` y `<Line>`.

---

## 🧠 4. Consejos Finales para un Dashboard Pro

1. **Separa las responsabilidades:** No pongas la llamada a la API (`axios.get`) dentro del mismo archivo de la gráfica. Usa `Zustand` para tener un "Store" centralizado que haga la petición, y que tus gráficas solo se encarguen de dibujar.
2. **Usa `ResponsiveContainer` siempre:** Recharts no es responsivo por defecto. Siempre envuelve tus gráficos en `<ResponsiveContainer width="100%" height="100%">` y ponle tamaño al `div` padre.
3. **Maneja los textos largos:** Si tus textos en el Eje X son muy largos, usa la propiedad `tickFormatter` en `<XAxis>` para recortarlos y que no se salgan de la pantalla.
