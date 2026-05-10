import { pool } from '../config/database';
import { Estudiante, Asignatura, Curso, Matricula, Calificacion } from '../models/academic.model';

export const getAllEstudiantes = async (): Promise<Estudiante[]> => {
  const result = await pool.query<Estudiante>(
    'SELECT numero_documento, tipo_documento, nombres, apellidos, direccion, correo_institucional, correo_personal, telefono, semestre_actual FROM estudiante'
  );
  return result.rows;
};

export const getAllAsignaturas = async (): Promise<Asignatura[]> => {
  const result = await pool.query<Asignatura>(
    'SELECT codigo_asignatura, nombre_asignatura, semestre_plan, creditos FROM asignatura'
  );
  return result.rows;
};

export const getAllCursos = async (): Promise<Curso[]> => {
  const result = await pool.query<Curso>(
    'SELECT id_curso, codigo_asignatura, periodo, docente_asignado FROM curso'
  );
  return result.rows;
};

export const getAllMatriculas = async (): Promise<Matricula[]> => {
  const result = await pool.query<Matricula>(
    'SELECT id_matricula, numero_documento, id_curso FROM matricula'
  );
  return result.rows;
};

export const getAllCalificaciones = async (): Promise<Calificacion[]> => {
  const result = await pool.query<Calificacion>(
    'SELECT id_matricula, seguimiento_1, seguimiento_2, seguimiento_3, nota_final FROM calificacion'
  );
  return result.rows;
};
