import { pool } from '../config/database';
import { Estudiante, Asignatura, Curso, Matricula, Calificacion } from '../models/academic.model';

export const getAllEstudiantes = async (): Promise<Estudiante[]> => {
  const result = await pool.query('SELECT * FROM estudiante');
  return result.rows;
};

export const getAllAsignaturas = async (): Promise<Asignatura[]> => {
  const result = await pool.query('SELECT * FROM asignatura');
  return result.rows;
};

export const getAllCursos = async (): Promise<Curso[]> => {
  const result = await pool.query('SELECT * FROM curso');
  return result.rows;
};

export const getAllMatriculas = async (): Promise<Matricula[]> => {
  const result = await pool.query('SELECT * FROM matricula');
  return result.rows;
};

export const getAllCalificaciones = async (): Promise<Calificacion[]> => {
  const result = await pool.query('SELECT * FROM calificacion');
  return result.rows;
};
