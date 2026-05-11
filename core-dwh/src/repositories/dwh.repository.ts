import { dwhPool } from '../config/dwh';
import type { ISubjectPerformance, ILaboratoryUsage, ILibraryImpact } from '../types/dashboard';

export interface IKpiData {
  promedioGeneral: number;
  totalEstudiantes: number;
  estudiantesEnRiesgo: number;
  tasaUtilizacionRecursos: number;
}

/** Promedio de notas por asignatura desde el DWH */
export const getSubjectPerformance = async (): Promise<ISubjectPerformance[]> => {
  const { rows } = await dwhPool.query(`
    SELECT
      a.nombre_asignatura AS asignatura,
      ROUND(AVG((f.nota_seguimiento_1 + f.nota_seguimiento_2 + f.nota_seguimiento_3 + f.nota_final) / 4.0), 2)
        AS "promedioNotas"
    FROM umariana_dwh.fact_academico f
    JOIN umariana_dwh.dim_asignatura a ON f.codigo_asignatura = a.codigo_asignatura
    GROUP BY a.nombre_asignatura
    ORDER BY "promedioNotas" DESC
  `);
  return rows;
};

/** Correlación nivel actividad biblioteca vs promedio notas */
export const getLibraryImpact = async (): Promise<ILibraryImpact[]> => {
  // Count students per activity level from dim_estudiante (populated from MongoDB)
  const { rows } = await dwhPool.query(`
    SELECT
      nivel_actividad_biblioteca AS "nivelActividad",
      COUNT(*) AS "totalEstudiantes"
    FROM umariana_dwh.dim_estudiante
    GROUP BY nivel_actividad_biblioteca
    ORDER BY "totalEstudiantes" DESC
  `);

  // Map to ILibraryImpact using student count as the metric
  return rows.map(r => ({
    nivelActividad: r.nivelActividad,
    promedioNotas: Number(r.totalEstudiantes),
  }));
};

/** Horas de uso por equipo de laboratorio */
export const getLaboratoryUsage = async (): Promise<ILaboratoryUsage[]> => {
  const { rows } = await dwhPool.query(`
    SELECT
      eq.descripcion_equipo AS equipo,
      SUM(f.duracion_minutos) AS "horasUso"
    FROM umariana_dwh.fact_uso_laboratorio f
    JOIN umariana_dwh.dim_equipo_lab eq ON f.id_equipo = eq.id_equipo
    GROUP BY eq.descripcion_equipo
    ORDER BY "horasUso" DESC
  `);
  return rows;
};

export interface ICruceData {
  id_estudiante: string;
  total_minutos_lab: number;
  promedio_notas: number;
}

/** Cruce: horas en laboratorio vs promedio de notas por estudiante */
export const getCruceLabNotas = async (): Promise<ICruceData[]> => {
  const { rows } = await dwhPool.query(`
    SELECT
      f.id_estudiante,
      COALESCE(SUM(l.duracion_minutos), 0) AS total_minutos_lab,
      ROUND(AVG((f.nota_seguimiento_1 + f.nota_seguimiento_2 + f.nota_seguimiento_3 + f.nota_final) / 4.0), 2) AS promedio_notas
    FROM umariana_dwh.fact_academico f
    LEFT JOIN umariana_dwh.fact_uso_laboratorio l ON f.id_estudiante = l.id_estudiante
    GROUP BY f.id_estudiante
    HAVING AVG((f.nota_seguimiento_1 + f.nota_seguimiento_2 + f.nota_seguimiento_3 + f.nota_final) / 4.0) IS NOT NULL
    ORDER BY total_minutos_lab DESC
  `);
  return rows;
};

/** KPIs estratégicos */
export const getKpis = async (): Promise<IKpiData> => {
  const [kpiRes, riesgoRes, recursosRes] = await Promise.all([
    dwhPool.query(`
      SELECT
        ROUND(AVG((f.nota_seguimiento_1 + f.nota_seguimiento_2 + f.nota_seguimiento_3 + f.nota_final) / 4.0), 2) AS promedio,
        COUNT(DISTINCT f.id_estudiante) AS total_estudiantes
      FROM umariana_dwh.fact_academico f
    `),
    dwhPool.query(`
      SELECT COUNT(DISTINCT id_estudiante) AS en_riesgo
      FROM umariana_dwh.fact_academico
      WHERE (nota_seguimiento_1 + nota_seguimiento_2 + nota_seguimiento_3 + nota_final) / 4.0 < 3.5
    `),
    dwhPool.query(`
      SELECT
        (SELECT COUNT(DISTINCT id_estudiante) FROM umariana_dwh.fact_uso_biblioteca) +
        (SELECT COUNT(DISTINCT id_estudiante) FROM umariana_dwh.fact_uso_laboratorio) AS usaron_recursos,
        (SELECT COUNT(*) FROM umariana_dwh.dim_estudiante) AS total
    `),
  ]);

  const total = Number(kpiRes.rows[0].total_estudiantes) || 1;
  const usaron = Number(recursosRes.rows[0].usaron_recursos) || 0;
  const totalEst = Number(recursosRes.rows[0].total) || 1;

  return {
    promedioGeneral:          Number(kpiRes.rows[0].promedio) || 0,
    totalEstudiantes:         total,
    estudiantesEnRiesgo:      Number(riesgoRes.rows[0].en_riesgo) || 0,
    tasaUtilizacionRecursos:  Math.round((usaron / totalEst) * 100),
  };
};
