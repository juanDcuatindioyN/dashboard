/**
 * generate-csv.js
 * Genera un CSV de laboratorios con datos realistas basados en los
 * estudiantes reales de la DB y lo guarda en backend-laboratories/data/raw/
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const EQUIPOS = ['PC-01','PC-02','PC-03','PC-04','PC-05','PC-06','PC-07','PC-08','PC-09','PC-10'];
const SEMESTRES = ['2025-1','2025-2','2026-1'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

function randomTime(startH, endH) {
  const h = randomInt(startH, endH);
  const m = randomInt(0, 59);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`;
}

async function main() {
  const res = await pool.query('SELECT numero_documento, semestre_actual FROM estudiante LIMIT 109');
  const estudiantes = res.rows;

  const rows = ['id_estudiante,semestre,fecha,hora_entrada,hora_salida,equipo_utilizado'];

  for (const est of estudiantes) {
    const visits = randomInt(3, 8);
    for (let i = 0; i < visits; i++) {
      const fecha = randomDate(new Date('2025-02-01'), new Date('2026-04-30'));
      const entradaH = randomInt(7, 17);
      const salidaH = entradaH + randomInt(1, 3);
      const entrada = randomTime(entradaH, entradaH);
      const salida  = randomTime(Math.min(salidaH, 20), Math.min(salidaH, 20));
      const equipo  = EQUIPOS[randomInt(0, EQUIPOS.length - 1)];
      const semestre = SEMESTRES[randomInt(0, SEMESTRES.length - 1)];
      rows.push(`${est.numero_documento},${semestre},${fecha},${entrada},${salida},${equipo}`);
    }
  }

  const outDir = path.join(__dirname, '..', '..', 'backend-laboratories', 'data', 'raw');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'laboratorios_2025_2026.csv');
  fs.writeFileSync(outPath, rows.join('\n'));
  console.log(`✅ CSV generated: ${outPath}`);
  console.log(`   Rows: ${rows.length - 1}`);
  await pool.end();
}

main().catch(e => { console.error('❌', e.message); pool.end(); });
