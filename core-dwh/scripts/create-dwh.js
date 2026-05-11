/**
 * create-dwh.js
 * Crea el schema 'dwh' con las tablas de hechos y dimensiones.
 * Ejecutar una sola vez: node scripts/create-dwh.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SQL = `
-- ── Schema ────────────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS dwh;

-- ── Dimensiones ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dwh.dim_estudiante (
  id_estudiante         VARCHAR(20) PRIMARY KEY,
  tipo_documento        VARCHAR(10),
  nombres               VARCHAR(200),
  apellidos             VARCHAR(200),
  correo_institucional  VARCHAR(200),
  semestre_actual       INTEGER,
  nivel_actividad_biblioteca VARCHAR(20) DEFAULT 'Sin actividad'
);

CREATE TABLE IF NOT EXISTS dwh.dim_asignatura (
  codigo_asignatura  VARCHAR(20) PRIMARY KEY,
  nombre_asignatura  VARCHAR(200),
  creditos           INTEGER,
  semestre_plan      INTEGER
);

CREATE TABLE IF NOT EXISTS dwh.dim_tiempo (
  id_fecha        DATE PRIMARY KEY,
  anio            INTEGER,
  mes             INTEGER,
  dia             INTEGER,
  dia_semana      VARCHAR(20),
  periodo_academico VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS dwh.dim_equipo_lab (
  id_equipo          SERIAL PRIMARY KEY,
  descripcion_equipo VARCHAR(100) UNIQUE
);

-- ── Hechos ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dwh.fact_academico (
  id_hecho           SERIAL PRIMARY KEY,
  id_estudiante      VARCHAR(20) REFERENCES dwh.dim_estudiante(id_estudiante),
  codigo_asignatura  VARCHAR(20) REFERENCES dwh.dim_asignatura(codigo_asignatura),
  id_fecha           DATE        REFERENCES dwh.dim_tiempo(id_fecha),
  id_curso           INTEGER,
  docente_asignado   VARCHAR(200),
  asistio            BOOLEAN,
  nota_seguimiento_1 NUMERIC(4,2),
  nota_seguimiento_2 NUMERIC(4,2),
  nota_seguimiento_3 NUMERIC(4,2),
  nota_final         NUMERIC(4,2)
);

CREATE TABLE IF NOT EXISTS dwh.fact_uso_biblioteca (
  id_hecho                  SERIAL PRIMARY KEY,
  id_estudiante             VARCHAR(20) REFERENCES dwh.dim_estudiante(id_estudiante),
  id_fecha                  DATE        REFERENCES dwh.dim_tiempo(id_fecha),
  tipo_interaccion          VARCHAR(50),
  recurso_id                VARCHAR(100),
  cantidad_articulos        INTEGER DEFAULT 0,
  horas_lectura_acumuladas  NUMERIC(6,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dwh.fact_uso_laboratorio (
  id_hecho          SERIAL PRIMARY KEY,
  id_estudiante     VARCHAR(20) REFERENCES dwh.dim_estudiante(id_estudiante),
  id_equipo         INTEGER     REFERENCES dwh.dim_equipo_lab(id_equipo),
  id_fecha          DATE        REFERENCES dwh.dim_tiempo(id_fecha),
  hora_entrada      TIME,
  hora_salida       TIME,
  duracion_minutos  INTEGER
);
`;

async function main() {
  console.log('Creating DWH schema and tables...');
  try {
    await pool.query(SQL);
    console.log('✅ Schema dwh created successfully');

    // Verify
    const res = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'dwh' ORDER BY table_name
    `);
    console.log('Tables created:', res.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
