import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined. Check your .env file.');
}

// Same DB as academic-record but uses the 'dwh' schema
export const dwhPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

dwhPool.on('error', (err: Error) => {
  console.error('[dwh] Unexpected error on idle client', err);
  process.exit(-1);
});
