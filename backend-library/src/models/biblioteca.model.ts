import { Schema, model, Document } from 'mongoose';

export interface IBiblioteca extends Document {
  numero_documento: string;
  nombre_estudiante: string;
  metricas_globales: {
    total_horas_lectura_digital?: number;
    nivel_actividad?: string;
    // legacy fields
    total_prestamos_fisicos?: number;
    total_accesos_bd_cientificas?: number;
    total_descargas_material?: number;
    horas_lectura_acumuladas?: number;
  };
  historial_prestamos_fisicos: any[];
  accesos_bases_datos_cientificas: any[];
  descargas_material_estudio: any[];
}

const BibliotecaSchema = new Schema(
  {
    numero_documento:  { type: String, required: true, index: true },
    nombre_estudiante: { type: String, required: true },
    metricas_globales: { type: Object, default: {} },
    historial_prestamos_fisicos:     { type: Array, default: [] },
    accesos_bases_datos_cientificas: { type: Array, default: [] },
    descargas_material_estudio:      { type: Array, default: [] },
  },
  { collection: 'recursos_biblioteca' }  // coleccion correcta
);

export const BibliotecaModel = model<IBiblioteca>('Biblioteca', BibliotecaSchema);
