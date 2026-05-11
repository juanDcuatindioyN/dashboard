import { pool } from '../config/database';
import { dwhPool } from '../config/dwh';
import axios from 'axios';

const ACADEMIC_URL     = process.env.ACADEMIC_URL     || 'http://localhost:3000/api';
const LIBRARY_URL      = process.env.LIBRARY_URL      || 'http://localhost:4000/api/library';
const LABORATORIES_URL = process.env.LABORATORIES_URL || 'http://localhost:3002/api/v1/files';

// ── Helpers ──────────────────────────────────────────────────────────────────

const normalizeId = (id: string) => String(id).trim().replace(/^0+/, '');

const normalizeDate = (raw: string): string => {
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/');
    return `${y}-${m}-${d}`;
  }
  return s;
};

const toPeriodo = (date: string): string => {
  const d = new Date(date);
  const m = d.getMonth() + 1;
  return `${d.getFullYear()}-${m <= 6 ? '1' : '2'}`;
};

// ── Step 1: Load dim_tiempo ──────────────────────────────────────────────────

async function loadDimTiempo(dates: string[]) {
  const unique = [...new Set(dates.map(normalizeDate))];
  for (const d of unique) {
    const dt = new Date(d);
    await dwhPool.query(`
      INSERT INTO dwh.dim_tiempo (id_fecha, anio, mes, dia, dia_semana, periodo_academico)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (id_fecha) DO NOTHING
    `, [d, dt.getFullYear(), dt.getMonth()+1, dt.getDate(),
        ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][dt.getDay()],
        toPeriodo(d)]);
  }
  console.log(`[loader] dim_tiempo: ${unique.length} dates`);
}

// ── Step 2: Load dim_estudiante ──────────────────────────────────────────────

async function loadDimEstudiante(libraryData: any[]) {
  const libMap = new Map(libraryData.map((d: any) => [
    normalizeId(d.numero_documento),
    d.metricas_globales
  ]));

  // Load students from PostgreSQL
  const { rows } = await pool.query(
    'SELECT numero_documento, tipo_documento, nombres, apellidos, correo_institucional, semestre_actual FROM estudiante'
  );

  for (const e of rows) {
    const id = normalizeId(e.numero_documento);
    const metricas = libMap.get(id);

    // Use nivel_actividad directly if available, otherwise calculate from totals
    let nivel = 'Sin actividad';
    if (metricas) {
      if (metricas.nivel_actividad) {
        const raw = String(metricas.nivel_actividad).toLowerCase();
        if (raw === 'alto' || raw === 'alta')        nivel = 'Alta';
        else if (raw === 'medio' || raw === 'media') nivel = 'Media';
        else if (raw === 'bajo' || raw === 'baja')   nivel = 'Baja';
        else nivel = 'Sin actividad';
      } else {
        const total = (metricas.total_prestamos_fisicos || 0) +
                      (metricas.total_accesos_bd_cientificas || 0) +
                      (metricas.total_descargas_material || 0);
        nivel = total === 0 ? 'Sin actividad' : total <= 3 ? 'Baja' : total <= 7 ? 'Media' : 'Alta';
      }
    }

    await dwhPool.query(`
      INSERT INTO dwh.dim_estudiante
        (id_estudiante, tipo_documento, nombres, apellidos, correo_institucional, semestre_actual, nivel_actividad_biblioteca)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (id_estudiante) DO UPDATE SET
        nivel_actividad_biblioteca = EXCLUDED.nivel_actividad_biblioteca
    `, [id, e.tipo_documento, e.nombres, e.apellidos, e.correo_institucional, e.semestre_actual, nivel]);
  }

  // Also insert MongoDB-only students so fact_uso_biblioteca can reference them
  for (const doc of libraryData) {
    const id = normalizeId(doc.numero_documento);
    const metricas = doc.metricas_globales || {};
    let nivel = 'Sin actividad';
    if (metricas.nivel_actividad) {
      const raw = String(metricas.nivel_actividad).toLowerCase();
      if (raw === 'alto' || raw === 'alta')        nivel = 'Alta';
      else if (raw === 'medio' || raw === 'media') nivel = 'Media';
      else if (raw === 'bajo' || raw === 'baja')   nivel = 'Baja';
    }
    await dwhPool.query(`
      INSERT INTO dwh.dim_estudiante
        (id_estudiante, tipo_documento, nombres, apellidos, correo_institucional, semestre_actual, nivel_actividad_biblioteca)
      VALUES ($1,'CC',$2,$3,'',$4,$5)
      ON CONFLICT (id_estudiante) DO UPDATE SET
        nivel_actividad_biblioteca = EXCLUDED.nivel_actividad_biblioteca
    `, [id, doc.nombre_estudiante || '', '', 0, nivel]);
  }

  console.log(`[loader] dim_estudiante: ${rows.length} from PostgreSQL + ${libraryData.length} from MongoDB`);
}

// ── Step 3: Load dim_asignatura ──────────────────────────────────────────────

async function loadDimAsignatura() {
  const { rows } = await pool.query(
    'SELECT codigo_asignatura, nombre_asignatura, creditos, semestre_plan FROM asignatura'
  );
  for (const a of rows) {
    await dwhPool.query(`
      INSERT INTO dwh.dim_asignatura (codigo_asignatura, nombre_asignatura, creditos, semestre_plan)
      VALUES ($1,$2,$3,$4)
      ON CONFLICT (codigo_asignatura) DO NOTHING
    `, [a.codigo_asignatura, a.nombre_asignatura, a.creditos, a.semestre_plan]);
  }
  console.log(`[loader] dim_asignatura: ${rows.length} subjects`);
}

// ── Step 4: Load dim_equipo_lab ──────────────────────────────────────────────

async function loadDimEquipoLab(labRecords: any[]) {
  const equipos = [...new Set(labRecords.map((r: any) => String(r.equipo_utilizado).trim().toUpperCase()))];
  for (const eq of equipos) {
    await dwhPool.query(`
      INSERT INTO dwh.dim_equipo_lab (descripcion_equipo)
      VALUES ($1) ON CONFLICT (descripcion_equipo) DO NOTHING
    `, [eq]);
  }
  console.log(`[loader] dim_equipo_lab: ${equipos.length} equipment`);
}

// ── Step 5: Load fact_academico ──────────────────────────────────────────────

async function loadFactAcademico() {
  const { rows: matriculas } = await pool.query('SELECT * FROM matricula');
  const { rows: calificaciones } = await pool.query('SELECT * FROM calificacion');
  const { rows: asistencias } = await pool.query('SELECT * FROM asistencia');
  const { rows: cursos } = await pool.query('SELECT * FROM curso');

  const calMap = new Map(calificaciones.map(c => [c.id_matricula, c]));
  const cursoMap = new Map(cursos.map(c => [c.id_curso, c]));

  // Group asistencias by matricula
  const asistMap = new Map<number, any[]>();
  for (const a of asistencias) {
    if (!asistMap.has(a.id_matricula)) asistMap.set(a.id_matricula, []);
    asistMap.get(a.id_matricula)!.push(a);
  }

  // Ensure a reference date exists
  const refDate = '2025-08-01';
  await dwhPool.query(`
    INSERT INTO dwh.dim_tiempo (id_fecha, anio, mes, dia, dia_semana, periodo_academico)
    VALUES ($1,2025,8,1,'Viernes','2025-2') ON CONFLICT DO NOTHING
  `, [refDate]);

  let count = 0;
  for (const m of matriculas) {
    const cal = calMap.get(m.id_matricula);
    const curso = cursoMap.get(m.id_curso);
    if (!cal || !curso) continue;

    const asists = asistMap.get(m.id_matricula) || [];
    const asistio = asists.length > 0 ? asists.filter((a: any) => a.estado_asistencia).length / asists.length > 0.5 : null;

    await dwhPool.query(`
      INSERT INTO dwh.fact_academico
        (id_estudiante, codigo_asignatura, id_fecha, id_curso, docente_asignado,
         asistio, nota_seguimiento_1, nota_seguimiento_2, nota_seguimiento_3, nota_final)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `, [
      normalizeId(m.numero_documento),
      curso.codigo_asignatura,
      refDate,
      m.id_curso,
      curso.docente_asignado,
      asistio,
      cal.seguimiento_1, cal.seguimiento_2, cal.seguimiento_3, cal.nota_final
    ]);
    count++;
  }
  console.log(`[loader] fact_academico: ${count} records`);
}

// ── Step 6: Load fact_uso_biblioteca ────────────────────────────────────────

async function loadFactUsoBiblioteca(libraryData: any[]) {
  // Get valid student IDs from DWH to avoid FK violations
  const { rows: validStudents } = await dwhPool.query('SELECT id_estudiante FROM dwh.dim_estudiante');
  const validIds = new Set(validStudents.map((r: any) => r.id_estudiante));

  let count = 0;
  for (const doc of libraryData) {
    const id = normalizeId(doc.numero_documento);
    if (!validIds.has(id)) continue; // skip if student not in DWH

    for (const p of (doc.historial_prestamos_fisicos || [])) {
      const fecha = normalizeDate(p.fecha_prestamo || p.fecha || '2025-08-01');
      await dwhPool.query(`
        INSERT INTO dwh.dim_tiempo (id_fecha, anio, mes, dia, dia_semana, periodo_academico)
        VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING
      `, [fecha, new Date(fecha).getFullYear(), new Date(fecha).getMonth()+1,
          new Date(fecha).getDate(), 'Lunes', toPeriodo(fecha)]);

      await dwhPool.query(`
        INSERT INTO dwh.fact_uso_biblioteca
          (id_estudiante, id_fecha, tipo_interaccion, recurso_id, cantidad_articulos, horas_lectura_acumuladas)
        VALUES ($1,$2,'prestamo_fisico',$3,1,0)
      `, [id, fecha, p.id_prestamo || p.titulo_recurso || p.id_libro || 'N/A']);
      count++;
    }

    for (const a of (doc.accesos_bases_datos_cientificas || [])) {
      const fecha = normalizeDate(a.fecha_acceso || '2025-08-01');
      await dwhPool.query(`
        INSERT INTO dwh.dim_tiempo (id_fecha, anio, mes, dia, dia_semana, periodo_academico)
        VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING
      `, [fecha, new Date(fecha).getFullYear(), new Date(fecha).getMonth()+1,
          new Date(fecha).getDate(), 'Lunes', toPeriodo(fecha)]);

      await dwhPool.query(`
        INSERT INTO dwh.fact_uso_biblioteca
          (id_estudiante, id_fecha, tipo_interaccion, recurso_id, cantidad_articulos, horas_lectura_acumuladas)
        VALUES ($1,$2,'acceso_bd',$3,$4,$5)
      `, [id, fecha, a.nombre_base || a.plataforma || 'N/A',
          a.articulos_consultados || 0, (a.duracion_minutos || 0) / 60]);
      count++;
    }

    for (const d of (doc.descargas_material_estudio || [])) {
      const fecha = normalizeDate(d.fecha_descarga || '2025-08-01');
      await dwhPool.query(`
        INSERT INTO dwh.dim_tiempo (id_fecha, anio, mes, dia, dia_semana, periodo_academico)
        VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING
      `, [fecha, new Date(fecha).getFullYear(), new Date(fecha).getMonth()+1,
          new Date(fecha).getDate(), 'Lunes', toPeriodo(fecha)]);

      await dwhPool.query(`
        INSERT INTO dwh.fact_uso_biblioteca
          (id_estudiante, id_fecha, tipo_interaccion, recurso_id, cantidad_articulos, horas_lectura_acumuladas)
        VALUES ($1,$2,'descarga',$3,1,0)
      `, [id, fecha, d.recurso_id || 'N/A']);
      count++;
    }
  }
  console.log(`[loader] fact_uso_biblioteca: ${count} records`);
}

// ── Step 7: Load fact_uso_laboratorio ────────────────────────────────────────

async function loadFactUsoLaboratorio(labRecords: any[]) {
  // Get equipment map
  const { rows: equipos } = await dwhPool.query('SELECT id_equipo, descripcion_equipo FROM dwh.dim_equipo_lab');
  const equipoMap = new Map(equipos.map(e => [e.descripcion_equipo, e.id_equipo]));

  let count = 0;
  for (const r of labRecords) {
    const id    = normalizeId(r.id_estudiante);
    const fecha = normalizeDate(r.fecha);
    const equipo = String(r.equipo_utilizado).trim().toUpperCase();
    const idEquipo = equipoMap.get(equipo);
    if (!idEquipo) continue;

    await dwhPool.query(`
      INSERT INTO dwh.fact_uso_laboratorio
        (id_estudiante, id_equipo, id_fecha, hora_entrada, hora_salida, duracion_minutos)
      VALUES ($1,$2,$3,$4,$5,$6)
    `, [id, idEquipo, fecha, r.hora_entrada, r.hora_salida, r.duracion_minutos || 0]);
    count++;
  }
  console.log(`[loader] fact_uso_laboratorio: ${count} records`);
}

// ── Main ETL ─────────────────────────────────────────────────────────────────

export const runFullEtl = async (): Promise<{ success: boolean; report: Record<string, string> }> => {
  const report: Record<string, string> = {};

  try {
    // Extract
    console.log('[ETL] Extracting data from all sources...');
    const [libraryRes, labRes] = await Promise.all([
      axios.get(`${LIBRARY_URL}`).then(r => r.data.data).catch(() => []),
      axios.get(`${LABORATORIES_URL}/clean`).then(r => r.data.data).catch(() => []),
    ]);

    // Collect all dates
    const allDates = [
      ...labRes.map((r: any) => normalizeDate(r.fecha)),
    ].filter(Boolean);

    // Load dimensions
    if (allDates.length) await loadDimTiempo(allDates);
    await loadDimAsignatura();
    await loadDimEstudiante(libraryRes);
    await loadDimEquipoLab(labRes);

    // Clear facts before reload
    await dwhPool.query('TRUNCATE dwh.fact_academico, dwh.fact_uso_biblioteca, dwh.fact_uso_laboratorio RESTART IDENTITY CASCADE');

    // Load facts
    await loadFactAcademico();
    if (libraryRes.length) await loadFactUsoBiblioteca(libraryRes);
    if (labRes.length) await loadFactUsoLaboratorio(labRes);

    report.status = 'completed';
    report.library_docs = String(libraryRes.length);
    report.lab_records  = String(labRes.length);
    console.log('[ETL] ✅ Completed successfully');
    return { success: true, report };
  } catch (err: any) {
    console.error('[ETL] ❌ Error:', err.message);
    report.status = 'failed';
    report.error  = err.message;
    return { success: false, report };
  }
};
