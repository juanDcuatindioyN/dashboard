import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const RAW_DIR   = path.join(__dirname, '..', '..', 'data', 'raw');
const CLEAN_DIR = path.join(__dirname, '..', '..', 'data', 'clean');
const ERROR_DIR = path.join(__dirname, '..', '..', 'data', 'error');

export interface LabRecord {
  id_estudiante:   string;
  semestre:        string;
  fecha:           string;  // YYYY-MM-DD
  hora_entrada:    string;  // HH:MM:SS
  hora_salida:     string;  // HH:MM:SS
  equipo_utilizado: string;
  duracion_minutos: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Normaliza número de documento: quita espacios y ceros a la izquierda */
const normalizeId = (id: string): string =>
  id.trim().replace(/^0+/, '');

/** Convierte fecha a YYYY-MM-DD */
const normalizeDate = (raw: string): string => {
  const clean = raw.trim();
  // DD/MM/YYYY → YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('/');
    return `${y}-${m}-${d}`;
  }
  // DD-MM-YYYY → YYYY-MM-DD
  if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('-');
    return `${y}-${m}-${d}`;
  }
  return clean; // already YYYY-MM-DD or unknown
};

/** Convierte hora a HH:MM:SS en formato 24h */
const normalizeTime = (raw: string): string => {
  const clean = raw.trim().toUpperCase();
  // 12h format: 2:30 PM
  const match12 = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (match12) {
    let h = parseInt(match12[1]);
    const m = match12[2];
    const s = match12[3] ?? '00';
    if (match12[4] === 'PM' && h < 12) h += 12;
    if (match12[4] === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}:${s}`;
  }
  // Already HH:MM or HH:MM:SS
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(clean)) {
    return clean.length === 5 ? `${clean}:00` : clean;
  }
  return clean;
};

/** Calcula duración en minutos entre dos tiempos HH:MM:SS */
const calcDuration = (entrada: string, salida: string): number => {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return Math.max(0, toMinutes(salida) - toMinutes(entrada));
};

// ── Service ──────────────────────────────────────────────────────────────────

/** Lista archivos CSV en /raw */
export const listRawFiles = (): string[] =>
  fs.readdirSync(RAW_DIR).filter((f) => f.endsWith('.csv'));

/** Procesa todos los CSV en /raw → /clean (errores → /error) */
export const processRawFiles = (): { processed: string[]; errors: string[] } => {
  const files = listRawFiles();
  const processed: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const rawPath = path.join(RAW_DIR, file);
    try {
      const content = fs.readFileSync(rawPath, 'utf-8');
      const rows = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];

      const cleaned: LabRecord[] = rows.map((row) => {
        const entrada = normalizeTime(row.hora_entrada ?? row.hora_entrada ?? '');
        const salida  = normalizeTime(row.hora_salida ?? '');
        return {
          id_estudiante:    normalizeId(row.id_estudiante ?? ''),
          semestre:         (row.semestre ?? '').trim(),
          fecha:            normalizeDate(row.fecha ?? ''),
          hora_entrada:     entrada,
          hora_salida:      salida,
          equipo_utilizado: (row.equipo_utilizado ?? '').trim().toUpperCase(),
          duracion_minutos: calcDuration(entrada, salida),
        };
      });

      // Save clean file as CSV (not JSON)
      const csvHeader = 'id_estudiante,semestre,fecha,hora_entrada,hora_salida,equipo_utilizado,duracion_minutos';
      const csvRows = cleaned.map(r =>
        `${r.id_estudiante},${r.semestre},${r.fecha},${r.hora_entrada},${r.hora_salida},${r.equipo_utilizado},${r.duracion_minutos}`
      );
      const cleanPath = path.join(CLEAN_DIR, file); // keep .csv extension
      fs.writeFileSync(cleanPath, [csvHeader, ...csvRows].join('\n'));
      fs.unlinkSync(rawPath);
      processed.push(file);
    } catch (err) {
      const errorPath = path.join(ERROR_DIR, file);
      fs.renameSync(rawPath, errorPath);
      errors.push(file);
    }
  }

  return { processed, errors };
};

/** Retorna todos los registros limpios como array */
export const getCleanRecords = (): LabRecord[] => {
  const files = fs.readdirSync(CLEAN_DIR).filter((f) => f.endsWith('.csv'));
  const all: LabRecord[] = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(CLEAN_DIR, file), 'utf-8');
    const rows = parse(content, { columns: true, skip_empty_lines: true, trim: true });
    all.push(...rows.map((r: any) => ({
      ...r,
      duracion_minutos: Number(r.duracion_minutos),
    })));
  }
  return all;
};
