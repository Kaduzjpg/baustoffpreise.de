import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { pool } from '../db';

async function ensureTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS _migrations (id INT AUTO_INCREMENT PRIMARY KEY, filename VARCHAR(255) NOT NULL UNIQUE, appliedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
}

async function main() {
  await ensureTable();
  const dir = path.resolve(process.cwd(), '../../db/migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  const [rows]: any = await pool.query('SELECT filename FROM _migrations');
  const applied = new Set((rows as any[]).map(r => r.filename));

  for (const f of files) {
    if (applied.has(f)) continue;
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    console.log(`[migrate] applying ${f}`);
    await pool.query(sql);
    await pool.query('INSERT INTO _migrations (filename) VALUES (?)', [f]);
  }
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


