import mysql from 'mysql2/promise';
import { env } from './env';

export const dbPool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
});

export async function pingDatabase(): Promise<void> {
  const conn = await dbPool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}


