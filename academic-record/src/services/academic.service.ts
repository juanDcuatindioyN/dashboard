import * as academicRepository from '../repositories/academic.repository';
import { Estudiante, Asignatura, Curso, Matricula, Calificacion } from '../models/academic.model';

/**
 * Retorna todos los estudiantes.
 * Aquí se puede agregar lógica de negocio: filtros, paginación, transformaciones.
 */
export const getEstudiantes = async (): Promise<Estudiante[]> => {
  return academicRepository.getAllEstudiantes();
};

/**
 * Retorna todas las asignaturas.
 */
export const getAsignaturas = async (): Promise<Asignatura[]> => {
  return academicRepository.getAllAsignaturas();
};

/**
 * Retorna todos los cursos.
 */
export const getCursos = async (): Promise<Curso[]> => {
  return academicRepository.getAllCursos();
};

/**
 * Retorna todas las matrículas.
 */
export const getMatriculas = async (): Promise<Matricula[]> => {
  return academicRepository.getAllMatriculas();
};

/**
 * Retorna todas las calificaciones.
 * Calcula además el promedio de cada registro.
 */
export const getCalificaciones = async (): Promise<(Calificacion & { promedio: number })[]> => {
  const data = await academicRepository.getAllCalificaciones();
  return data.map(c => ({
    ...c,
    promedio: Math.round(((c.seguimiento_1 + c.seguimiento_2 + c.seguimiento_3 + c.nota_final) / 4) * 100) / 100,
  }));
};
