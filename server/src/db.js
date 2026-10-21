import pg from 'pg';
import { readFileSync, readdirSync } from 'node:fs';

pg.types.setTypeParser(1082, (v) => v); // keep DATE columns as 'YYYY-MM-DD' strings
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const q = async (text, params) => (await pool.query(text, params)).rows;

// Runs db/*.sql in filename order on startup. Every file is idempotent.
export async function migrate() {
  const dir = new URL('../db/', import.meta.url);
  for (const file of readdirSync(dir).sort()) await pool.query(readFileSync(new URL(file, dir), 'utf8'));
}
