import mysql from 'mysql2/promise';
import { env } from './env';

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

export type DealerRow = {
  id: number;
  name: string;
  email: string;
  zip: string;
  city: string;
  street: string;
  radiusKm: number | null;
  lat: number | null;
  lng: number | null;
};

export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

export type ProductRow = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  unit: string | null;
  imageUrl: string | null;
  description: string | null;
  keywords: string | null;
};


