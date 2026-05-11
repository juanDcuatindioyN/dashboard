import * as bibliotecaRepository from '../repositories/biblioteca.repository';
import { IBiblioteca } from '../models/biblioteca.model';

/**
 * Retorna todos los documentos de biblioteca aplanados.
 */
export const getAllBiblioteca = async () => {
  return bibliotecaRepository.getAllBiblioteca();
};

/**
 * Retorna el documento de un estudiante por número de documento.
 */
export const getByNumeroDocumento = async (numero_documento: string) => {
  return bibliotecaRepository.getByNumeroDocumento(numero_documento);
};

/**
 * Retorna las métricas globales de todos los estudiantes.
 * Clasifica el nivel de actividad si no viene definido en el documento.
 */
export const getMetricasGlobales = async () => {
  const docs = await bibliotecaRepository.getMetricasGlobales();
  return docs.map((doc: any) => {
    const m = doc.metricas_globales || {};
    let nivel = m.nivel_actividad || 'Sin actividad';
    // Normalize Spanish level names
    if (nivel === 'Alto') nivel = 'Alta';
    else if (nivel === 'Medio') nivel = 'Media';
    else if (nivel === 'Bajo') nivel = 'Baja';
    return { ...doc, metricas_globales: { ...m, nivel_actividad: nivel } };
  });
};
