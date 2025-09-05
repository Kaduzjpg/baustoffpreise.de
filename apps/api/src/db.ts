import mysql from 'mysql2/promise';
import { env } from './env';
import { Kysely, MysqlDialect, Generated } from 'kysely';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

export * from './types/models';

// Kysely Setup
interface ProductTable {
  id: Generated<number>;
  categoryId: number;
  name: string;
  slug: string;
  unit: string | null;
  imageUrl: string | null;
  description: string | null;
  keywords: string | null;
  brand: string | null;
  stockType: string | null;
}

interface CategoriesTable {
  id: Generated<number>;
  parent_id: number | null;
  name: string;
  slug: string;
}

export interface Database {
  Product: ProductTable;
  categories: CategoriesTable;
}

export const db = new Kysely<Database>({
  dialect: new MysqlDialect({ pool })
});


