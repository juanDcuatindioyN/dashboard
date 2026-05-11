require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('ALTER SCHEMA dwh RENAME TO umariana_dwh')
  .then(() => { console.log('✅ Schema renamed: dwh → umariana_dwh'); pool.end(); })
  .catch(e => { console.error('❌', e.message); pool.end(); });
