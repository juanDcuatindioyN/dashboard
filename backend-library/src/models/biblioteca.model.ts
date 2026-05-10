import { Schema, model, Document } from 'mongoose';

export interface IBiblioteca extends Document {
  numero_documento: string;
  nombre_estudiante: string;
  metricas_globales: {
    total_prestamos_fisicos: number;
    total_accesos_bd_cientificas: number;
    total_descargas_material: number;
    horas_lectura_acumuladas: number;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  historial_prestamos_fisicos: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accesos_bases_datos_cientificas: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  descargas_material_estudio: any[];
}

const BibliotecaSchema = new Schema(
  {
    numero_documento:  { type: String, required: true, index: true },
    nombre_estudiante: { type: String, required: true },
    metricas_globales: {
      total_prestamos_fisicos:      { type: Number, default: 0 },
      total_accesos_bd_cientificas: { type: Number, default: 0 },
      total_descargas_material:     { type: Number, default: 0 },
      horas_lectura_acumuladas:     { type: Number, default: 0 },
    },
    historial_prestamos_fisicos:     { type: Array, default: [] },
    accesos_bases_datos_cientificas: { type: Array, default: [] },
    descargas_material_estudio:      { type: Array, default: [] },
  },
  { collection: 'estudiantes_biblioteca' }
);

export const BibliotecaModel = model<IBiblioteca>('Biblioteca', BibliotecaSchema);
