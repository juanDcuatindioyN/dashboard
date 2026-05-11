/**
 * generate-csv.js
 * Genera un CSV SUCIO de laboratorios con errores reales:
 * - Fechas en formato DD/MM/YYYY
 * - Horas en formato 12h (AM/PM)
 * - IDs con ceros a la izquierda
 * - Nombres de equipos en minúscula y con variaciones
 * - Algunos campos con espacios extra
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const EQUIPOS_SUCIOS = ['pc-01','PC-02 ','pc-03','PC-04','pc-05 ',' PC-06','PC-07','pc-08','PC-09','pc-10'];
const SEMESTRES = ['2025-1','2025-2','2026-1'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const day   = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year  = d.getFullYear();
  // Formato sucio: DD/MM/YYYY
  return `${day}/${month}/${year}`;
}

function randomTime12h(startH, endH) {
  const h24 = randomInt(startH, endH);
  const m   = randomInt(0, 59);
  // Convertir a 12h con AM/PM
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12    = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function padId(id) {
  // Agregar ceros a la izquierda para simular IDs sucios
  return '0' + id;
}

async function main() {
  const res = await pool.query('SELECT numero_documento, semestre_actual FROM estudiante LIMIT 109');
  const estudiantes = res.rows;

  const rows = ['id_estudiante,semestre,fecha,hora_entrada,hora_salida,equipo_utilizado'];

  for (const est of estudiantes) {
    const visits = randomInt(3, 8);
    for (let i = 0; i < visits; i++) {
      const fecha    = randomDate(new Date('2025-02-01'), new Date('2026-04-30'));
      const entradaH = randomInt(7, 17);
      const salidaH  = Math.min(entradaH + randomInt(1, 3), 20);
      const entrada  = randomTime12h(entradaH, entradaH);
      const salida   = randomTime12h(salidaH, salidaH);
      const equipo   = EQUIPOS_SUCIOS[randomInt(0, EQUIPOS_SUCIOS.length - 1)];
      const semestre = SEMESTRES[randomInt(0, SEMESTRES.length - 1)];
      // ID sucio con cero a la izquierda
      rows.push(`${padId(est.numero_documento)},${semestre},${fecha},${entrada},${salida},${equipo}`);
    }
  }

  const outDir = path.join(__dirname, '..', '..', 'backend-laboratories', 'data', 'raw');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'laboratorios_2025_2026.csv');
  fs.writeFileSync(outPath, rows.join('\n'));
  console.log(`CSV sucio generado: ${outPath}`);
  console.log(`Filas: ${rows.length - 1}`);
  console.log('Muestra de datos sucios:');
  rows.slice(1, 4).forEach(r => console.log(' ', r));
  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
