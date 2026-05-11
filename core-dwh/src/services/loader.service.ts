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

const toNivel = (raw: string): string => {
  const s = raw.toLowerCase();
  if (s === 'alto' || s === 'alta')        return 'Alta';
  if (s === 'medio' || s === 'media')      return 'Media';
  if (s === 'bajo' || s === 'baja')        return 'Baja';
  return 'Sin actividad';
};

// ── Step 1: Load dim_tiempo (batch) ──────────────────────────────────────────

async function loadDimTiempo(dates: string[]) {
  const unique = [...new Set(dates.map(normalizeDate))];
  if (!unique.length) return;

  const fechas: string[] = [], anios: number[] = [], meses: number[] = [],
        dias: number[] = [], diasSemana: string[] = [], periodos: string[] = [];

  for (const d of unique) {
    const dt = new Date(d);
    fechas.push(d);
    anios.push(dt.getFullYear());
    meses.push(dt.getMonth() + 1);
    dias.push(dt.getDate());
    diasSemana.push(['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][dt.getDay()]);
    periodos.push(toPeriodo(d));
  }

  await dwhPool.query(`
    INSERT INTO umariana_dwh.dim_tiempo (id_fecha, anio, mes, dia, dia_semana, periodo_academico)
    SELECT * FROM UNNEST($1::date[], $2::int[], $3::int[], $4::int[], $5::text[], $6::text[])
    ON CONFLICT (id_fecha) DO NOTHING
  `, [fechas, anios, meses, dias, diasSemana, periodos]);

  console.log(`[loader] dim_tiempo: ${unique.length} dates`);
}

// ── Step 2: Load dim_estudiante (batch) ──────────────────────────────────────

async function loadDimEstudiante(libraryData: any[]) {
  const libMap = new Map(libraryData.map((d: any) => [
    normalizeId(d.numero_documento), d.metricas_globales
  ]));

  const { rows } = await pool.query(
    'SELECT numero_documento, tipo_documento, nombres, apellidos, correo_institucional, semestre_actual FROM estudiante'
  );

  const ids: string[] = [], tipos: string[] = [], nombres: string[] = [],
        apellidos: string[] = [], correos: string[] = [],
        semestres: number[] = [], niveles: string[] = [];

  for (const e of rows) {
    const id = normalizeId(e.numero_documento);
    const metricas = libMap.get(id);
    let nivel = 'Sin actividad';
    if (metricas?.nivel_actividad) nivel = toNivel(metricas.nivel_actividad);
    else if (metricas) {
      const total = (metricas.total_prestamos_fisicos || 0) +
                    (metricas.total_accesos_bd_cientificas || 0) +
                    (metricas.total_descargas_material || 0);
      nivel = total === 0 ? 'Sin actividad' : total <= 3 ? 'Baja' : total <= 7 ? 'Media' : 'Alta';
    }
    ids.push(id); tipos.push(e.tipo_documento); nombres.push(e.nombres);
    apellidos.push(e.apellidos); correos.push(e.correo_institucional);
    semestres.push(e.semestre_actual); niveles.push(nivel);
  }

  await dwhPool.query(`
    INSERT INTO umariana_dwh.dim_estudiante
      (id_estudiante, tipo_documento, nombres, apellidos, correo_institucional, semestre_actual, nivel_actividad_biblioteca)
    SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::int[], $7::text[])
    ON CONFLICT (id_estudiante) DO UPDATE SET nivel_actividad_biblioteca = EXCLUDED.nivel_actividad_biblioteca
  `, [ids, tipos, nombres, apellidos, correos, semestres, niveles]);

  // MongoDB-only students
  const mIds: string[] = [], mNombres: string[] = [], mNiveles: string[] = [];
  for (const doc of libraryData) {
    const id = normalizeId(doc.numero_documento);
    const nivel = doc.metricas_globales?.nivel_actividad
      ? toNivel(doc.metricas_globales.nivel_actividad) : 'Sin actividad';
    mIds.push(id); mNombres.push(doc.nombre_estudiante || ''); mNiveles.push(nivel);
  }

  if (mIds.length) {
    await dwhPool.query(`
      INSERT INTO umariana_dwh.dim_estudiante
        (id_estudiante, tipo_documento, nombres, apellidos, correo_institucional, semestre_actual, nivel_actividad_biblioteca)
      SELECT id, 'CC', nom, '', '', 0, niv
      FROM UNNEST($1::text[], $2::text[], $3::text[]) AS t(id, nom, niv)
      ON CONFLICT (id_estudiante) DO UPDATE SET nivel_actividad_biblioteca = EXCLUDED.nivel_actividad_biblioteca
    `, [mIds, mNombres, mNiveles]);
  }

  console.log(`[loader] dim_estudiante: ${rows.length} from PostgreSQL + ${libraryData.length} from MongoDB`);
}

// ── Step 3: Load dim_asignatura (batch) ──────────────────────────────────────

async function loadDimAsignatura() {
  const { rows } = await pool.query(
    'SELECT codigo_asignatura, nombre_asignatura, creditos, semestre_plan FROM asignatura'
  );
  const codigos = rows.map(r => r.codigo_asignatura);
  const nombres = rows.map(r => r.nombre_asignatura);
  const creditos = rows.map(r => r.creditos);
  const semestres = rows.map(r => r.semestre_plan);

  await dwhPool.query(`
    INSERT INTO umariana_dwh.dim_asignatura (codigo_asignatura, nombre_asignatura, creditos, semestre_plan)
    SELECT * FROM UNNEST($1::text[], $2::text[], $3::int[], $4::int[])
    ON CONFLICT (codigo_asignatura) DO NOTHING
  `, [codigos, nombres, creditos, semestres]);

  console.log(`[loader] dim_asignatura: ${rows.length} subjects`);
}

// ── Step 4: Load dim_equipo_lab (batch) ──────────────────────────────────────

async function loadDimEquipoLab(labRecords: any[]) {
  const equipos = [...new Set(labRecords.map((r: any) => String(r.equipo_utilizado).trim().toUpperCase()))];
  if (!equipos.length) return;

  await dwhPool.query(`
    INSERT INTO umariana_dwh.dim_equipo_lab (descripcion_equipo)
    SELECT UNNEST($1::text[])
    ON CONFLICT (descripcion_equipo) DO NOTHING
  `, [equipos]);

  console.log(`[loader] dim_equipo_lab: ${equipos.length} equipment`);
}

// ── Step 5: Load fact_academico (batch) ──────────────────────────────────────

async function loadFactAcademico() {
  const { rows: matriculas } = await pool.query('SELECT * FROM matricula');
  const { rows: calificaciones } = await pool.query('SELECT * FROM calificacion');
  const { rows: asistencias } = await pool.query('SELECT * FROM asistencia');
  const { rows: cursos } = await pool.query('SELECT * FROM curso');

  const calMap = new Map(calificaciones.map(c => [c.id_matricula, c]));
  const cursoMap = new Map(cursos.map(c => [c.id_curso, c]));
  const asistMap = new Map<number, any[]>();
  for (const a of asistencias) {
    if (!asistMap.has(a.id_matricula)) asistMap.set(a.id_matricula, []);
    asistMap.get(a.id_matricula)!.push(a);
  }

  const refDate = '2025-08-01';
  await dwhPool.query(`
    INSERT INTO umariana_dwh.dim_tiempo (id_fecha, anio, mes, dia, dia_semana, periodo_academico)
    VALUES ($1,2025,8,1,'Viernes','2025-2') ON CONFLICT DO NOTHING
  `, [refDate]);

  const estIds: string[] = [], codigos: string[] = [], fechas: string[] = [],
        cursoIds: number[] = [], docentes: string[] = [], asistio: (boolean|null)[] = [],
        s1: number[] = [], s2: number[] = [], s3: number[] = [], nf: number[] = [];

  for (const m of matriculas) {
    const cal = calMap.get(m.id_matricula);
    const curso = cursoMap.get(m.id_curso);
    if (!cal || !curso) continue;
    const asists = asistMap.get(m.id_matricula) || [];
    const asistVal = asists.length > 0
      ? asists.filter((a: any) => a.estado_asistencia).length / asists.length > 0.5
      : null;
    estIds.push(normalizeId(m.numero_documento));
    codigos.push(curso.codigo_asignatura);
    fechas.push(refDate);
    cursoIds.push(m.id_curso);
    docentes.push(curso.docente_asignado);
    asistio.push(asistVal);
    s1.push(cal.seguimiento_1); s2.push(cal.seguimiento_2);
    s3.push(cal.seguimiento_3); nf.push(cal.nota_final);
  }

  await dwhPool.query(`
    INSERT INTO umariana_dwh.fact_academico
      (id_estudiante, codigo_asignatura, id_fecha, id_curso, docente_asignado,
       asistio, nota_seguimiento_1, nota_seguimiento_2, nota_seguimiento_3, nota_final)
    SELECT * FROM UNNEST($1::text[], $2::text[], $3::date[], $4::int[], $5::text[],
                         $6::boolean[], $7::numeric[], $8::numeric[], $9::numeric[], $10::numeric[])
  `, [estIds, codigos, fechas, cursoIds, docentes, asistio, s1, s2, s3, nf]);

  console.log(`[loader] fact_academico: ${estIds.length} records`);
}

// ── Step 6: Load fact_uso_biblioteca (batch) ─────────────────────────────────

async function loadFactUsoBiblioteca(libraryData: any[]) {
  const { rows: validStudents } = await dwhPool.query('SELECT id_estudiante FROM umariana_dwh.dim_estudiante');
  const validIds = new Set(validStudents.map((r: any) => r.id_estudiante));

  const estIds: string[] = [], fechas: string[] = [], tipos: string[] = [],
        recursos: string[] = [], cantidades: number[] = [], horas: number[] = [];

  for (const doc of libraryData) {
    const id = normalizeId(doc.numero_documento);
    if (!validIds.has(id)) continue;

    for (const p of (doc.historial_prestamos_fisicos || [])) {
      const fecha = normalizeDate(p.fecha_prestamo || p.fecha || '2025-08-01');
      estIds.push(id); fechas.push(fecha); tipos.push('prestamo_fisico');
      recursos.push(p.id_libro || p.titulo_recurso || 'N/A');
      cantidades.push(1); horas.push(0);
    }
    for (const a of (doc.accesos_bases_datos_cientificas || [])) {
      const fecha = normalizeDate(a.fecha_acceso || '2025-08-01');
      estIds.push(id); fechas.push(fecha); tipos.push('acceso_bd');
      recursos.push(a.plataforma || a.nombre_base || 'N/A');
      cantidades.push(a.articulos_consultados || 0);
      horas.push((a.duracion_minutos || 0) / 60);
    }
    for (const d of (doc.descargas_material_estudio || [])) {
      const fecha = normalizeDate(d.fecha_descarga || '2025-08-01');
      estIds.push(id); fechas.push(fecha); tipos.push('descarga');
      recursos.push(d.recurso_id || 'N/A'); cantidades.push(1); horas.push(0);
    }
  }

  if (estIds.length) {
    // Ensure all dates exist in dim_tiempo
    await loadDimTiempo(fechas);

    await dwhPool.query(`
      INSERT INTO umariana_dwh.fact_uso_biblioteca
        (id_estudiante, id_fecha, tipo_interaccion, recurso_id, cantidad_articulos, horas_lectura_acumuladas)
      SELECT * FROM UNNEST($1::text[], $2::date[], $3::text[], $4::text[], $5::int[], $6::numeric[])
    `, [estIds, fechas, tipos, recursos, cantidades, horas]);
  }

  console.log(`[loader] fact_uso_biblioteca: ${estIds.length} records`);
}

// ── Step 7: Load fact_uso_laboratorio (batch) ────────────────────────────────

async function loadFactUsoLaboratorio(labRecords: any[]) {
  const { rows: equipos } = await dwhPool.query('SELECT id_equipo, descripcion_equipo FROM umariana_dwh.dim_equipo_lab');
  const equipoMap = new Map(equipos.map(e => [e.descripcion_equipo, e.id_equipo]));

  const estIds: string[] = [], eqIds: number[] = [], fechas: string[] = [],
        entradas: string[] = [], salidas: string[] = [], duraciones: number[] = [];

  for (const r of labRecords) {
    const id = normalizeId(r.id_estudiante);
    const equipo = String(r.equipo_utilizado).trim().toUpperCase();
    const idEquipo = equipoMap.get(equipo);
    if (!idEquipo) continue;
    estIds.push(id); eqIds.push(idEquipo);
    fechas.push(normalizeDate(r.fecha));
    entradas.push(r.hora_entrada); salidas.push(r.hora_salida);
    duraciones.push(r.duracion_minutos || 0);
  }

  if (estIds.length) {
    await dwhPool.query(`
      INSERT INTO umariana_dwh.fact_uso_laboratorio
        (id_estudiante, id_equipo, id_fecha, hora_entrada, hora_salida, duracion_minutos)
      SELECT * FROM UNNEST($1::text[], $2::int[], $3::date[], $4::time[], $5::time[], $6::int[])
    `, [estIds, eqIds, fechas, entradas, salidas, duraciones]);
  }

  console.log(`[loader] fact_uso_laboratorio: ${estIds.length} records`);
}

// ── Main ETL ─────────────────────────────────────────────────────────────────

export const runFullEtl = async (): Promise<{ success: boolean; report: Record<string, string> }> => {
  const report: Record<string, string> = {};

  try {
    console.log('[ETL] Extracting data from all sources...');
    const [libraryRes, labRes] = await Promise.all([
      axios.get(`${LIBRARY_URL}`).then(r => r.data.data).catch(() => []),
      axios.get(`${LABORATORIES_URL}/clean`).then(r => r.data.data).catch(() => []),
    ]);

    const allDates = labRes.map((r: any) => normalizeDate(r.fecha)).filter(Boolean);

    if (allDates.length) await loadDimTiempo(allDates);
    await loadDimAsignatura();
    await loadDimEstudiante(libraryRes);
    await loadDimEquipoLab(labRes);

    await dwhPool.query('TRUNCATE umariana_dwh.fact_academico, umariana_dwh.fact_uso_biblioteca, umariana_dwh.fact_uso_laboratorio RESTART IDENTITY CASCADE');

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
