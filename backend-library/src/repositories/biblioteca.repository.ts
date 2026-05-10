import { BibliotecaModel } from '../models/biblioteca.model';

/**
 * Retorna todos los documentos de biblioteca aplanados.
 * Cada documento incluye las métricas globales y los arrays de actividad.
 */
export const getAllBiblioteca = async () => {
  const docs = await BibliotecaModel.find({}).lean();
  return docs;
};

/**
 * Retorna el documento de un estudiante específico por número de documento.
 */
export const getByNumeroDocumento = async (numero_documento: string) => {
  const doc = await BibliotecaModel.findOne({ numero_documento }).lean();
  return doc;
};

/**
 * Retorna solo las métricas globales de todos los estudiantes.
 * Útil para el ETL del core-dwh.
 */
export const getMetricasGlobales = async () => {
  const docs = await BibliotecaModel.find(
    {},
    { numero_documento: 1, nombre_estudiante: 1, metricas_globales: 1 }
  ).lean();
  return docs;
};
