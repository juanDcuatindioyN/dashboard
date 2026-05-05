import { pool } from '../config/database';
import type { ILibraryImpact, ILaboratoryUsage, ISubjectPerformance } from '../types/dashboard';

/**
 * Promedio de notas por asignatura.
 * Fórmula: (seguimiento_1 + seguimiento_2 + seguimiento_3 + nota_final) / 4
 */
export const getSubjectPerformance = async (): Promise<ISubjectPerformance[]> => {
  const result = await pool.query<ISubjectPerformance>(`
    SELECT
      a.nombre_asignatura AS asignatura,
      ROUND(
        AVG((c.seguimiento_1 + c.seguimiento_2 + c.seguimiento_3 + c.nota_final) / 4.0),
        2
      ) AS "promedioNotas"
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
 * Impacto de asistencia en notas.
 * Usa la tabla `asistencia` para clasificar estudiantes por nivel de actividad
 * y correlaciona con su promedio de calificaciones.
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
 * Uso por asignatura basado en horas de asistencia.
 * Usa la tabla `asistencia` agrupada por asignatura como proxy de uso.
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
