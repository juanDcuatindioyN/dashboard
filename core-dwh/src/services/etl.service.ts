import axios from 'axios';
import { pool } from '../config/database';
import type { ILibraryImpact, ILaboratoryUsage, ISubjectPerformance } from '../types/dashboard';

const ACADEMIC_URL    = process.env.ACADEMIC_URL    || 'http://localhost:3000/api';
const LIBRARY_URL     = process.env.LIBRARY_URL     || 'http://localhost:4000/api/library';
const LABORATORIES_URL = process.env.LABORATORIES_URL || 'http://localhost:3002/api/v1/files';

// ── Extract ──────────────────────────────────────────────────────────────────

export const extractAcademic = async () => {
  const [calificaciones, matriculas, cursos, asignaturas, estudiantes] = await Promise.all([
    axios.get(`${ACADEMIC_URL}/calificaciones`).then((r) => r.data.data),
    axios.get(`${ACADEMIC_URL}/matriculas`).then((r) => r.data.data),
    axios.get(`${ACADEMIC_URL}/cursos`).then((r) => r.data.data),
    axios.get(`${ACADEMIC_URL}/asignaturas`).then((r) => r.data.data),
    axios.get(`${ACADEMIC_URL}/estudiantes`).then((r) => r.data.data),
  ]);
  return { calificaciones, matriculas, cursos, asignaturas, estudiantes };
};

export const extractLibrary = async () => {
  const res = await axios.get(`${LIBRARY_URL}/metricas`);
  return res.data.data as Array<{
    numero_documento: string;
    metricas_globales: {
      total_prestamos_fisicos: number;
      total_accesos_bd_cientificas: number;
      total_descargas_material: number;
      horas_lectura_acumuladas: number;
    };
  }>;
};

export const extractLaboratories = async () => {
  const res = await axios.get(`${LABORATORIES_URL}/clean`);
  return res.data.data as Array<{
    id_estudiante: string;
    equipo_utilizado: string;
    duracion_minutos: number;
    fecha: string;
  }>;
};

// ── Transform & Analytics ────────────────────────────────────────────────────

/**
 * Promedio de notas por asignatura usando datos de academic-record (PostgreSQL).
 */
export const getSubjectPerformance = async (): Promise<ISubjectPerformance[]> => {
  const result = await pool.query<ISubjectPerformance>(`
    SELECT
      a.nombre_asignatura AS asignatura,
      ROUND(AVG((c.seguimiento_1 + c.seguimiento_2 + c.seguimiento_3 + c.nota_final) / 4.0), 2)
        AS "promedioNotas"
    FROM calificacion c
    JOIN matricula m  ON c.id_matricula = m.id_matricula
    JOIN curso cu     ON m.id_curso = cu.id_curso
    JOIN asignatura a ON cu.codigo_asignatura = a.codigo_asignatura
    GROUP BY a.nombre_asignatura
    ORDER BY "promedioNotas" DESC
  `);
  return result.rows;
};

/**
 * Correlación entre nivel de asistencia y promedio de notas.
 */
export const getLibraryImpact = async (): Promise<ILibraryImpact[]> => {
  const result = await pool.query<ILibraryImpact>(`
    SELECT
      CASE
        WHEN asistencia_pct >= 0.75 THEN 'Alta'
        WHEN asistencia_pct >= 0.50 THEN 'Media'
        WHEN asistencia_pct >= 0.25 THEN 'Baja'
        ELSE 'Sin actividad'
      END AS "nivelActividad",
      ROUND(AVG(promedio_notas), 2) AS "promedioNotas"
    FROM (
      SELECT
        m.numero_documento,
        AVG(CASE WHEN a.estado_asistencia THEN 1.0 ELSE 0.0 END) AS asistencia_pct,
        AVG((c.seguimiento_1 + c.seguimiento_2 + c.seguimiento_3 + c.nota_final) / 4.0) AS promedio_notas
      FROM matricula m
      JOIN asistencia a   ON m.id_matricula = a.id_matricula
      JOIN calificacion c ON m.id_matricula = c.id_matricula
      GROUP BY m.numero_documento
    ) sub
    GROUP BY "nivelActividad"
    ORDER BY "promedioNotas" DESC
  `);
  return result.rows;
};

/**
 * Asistencias por asignatura como proxy de uso de recursos.
 */
export const getLaboratoryUsage = async (): Promise<ILaboratoryUsage[]> => {
  const result = await pool.query<ILaboratoryUsage>(`
    SELECT
      a.nombre_asignatura AS equipo,
      COUNT(ast.id_asistencia) FILTER (WHERE ast.estado_asistencia = true) AS "horasUso"
    FROM asistencia ast
    JOIN matricula m  ON ast.id_matricula = m.id_matricula
    JOIN curso cu     ON m.id_curso = cu.id_curso
    JOIN asignatura a ON cu.codigo_asignatura = a.codigo_asignatura
    GROUP BY a.nombre_asignatura
    ORDER BY "horasUso" DESC
  `);
  return result.rows;
};
