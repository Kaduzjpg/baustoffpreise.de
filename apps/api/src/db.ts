import mysql from 'mysql2/promise';
import { env } from './env';
import { Kysely, MysqlDialect, Generated } from 'kysely';
import { timeDb } from './metrics';

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

// Wrap pool.query for timing convenience
const _query = pool.query.bind(pool);
(pool as any).query = (sql: any, params?: any) => timeDb('pool.query', _query(sql, params));

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

interface ProductVariantTable {
  id: Generated<number>;
  productId: number;
  format: string | null;
  variant: string | null;
  unit: string | null;
  sku: string | null;
  imageUrl: string | null;
}

interface ProductSpecTable {
  id: Generated<number>;
  productId: number;
  variantId: number | null;
  format: string | null;
  variant: string | null;
  specKey: string;
  specValue: string;
}

interface ProductDownloadTable {
  id: Generated<number>;
  productId: number;
  title: string;
  url: string;
}

interface ProductBundleTable {
  productId: number;
  relatedProductId: number;
  sort: number | null;
}

interface DealerTable {
  id: Generated<number>;
  name: string;
  email: string | null;
  zip: string | null;
  city: string | null;
  street: string | null;
  radiusKm: number | null;
  lat: number | null;
  lng: number | null;
  // location POINT in MySQL, als any typisiert
  location: any | null;
}

interface InquiryTable {
  id: Generated<number>;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  customerZip: string;
  customerStreet: string;
  customerCity: string;
  radiusKm: number;
  message: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: Date;
}

interface InquiryItemTable {
  id: Generated<number>;
  inquiryId: number;
  productId: number;
  quantity: number;
  note: string | null;
}

interface InquiryDealerNotificationTable {
  id: Generated<number>;
  inquiryId: number;
  dealerId: number;
  email: string | null;
  status: string; // 'sent' | 'failed'
  error: string | null;
  createdAt: Date;
}

interface PostalCodeTable {
  zip: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  updatedAt: Date;
}

export interface Database {
  Product: ProductTable;
  categories: CategoriesTable;
  ProductVariant: ProductVariantTable;
  ProductSpec: ProductSpecTable;
  ProductDownload: ProductDownloadTable;
  ProductBundle: ProductBundleTable;
  Dealer: DealerTable;
  Inquiry: InquiryTable;
  InquiryItem: InquiryItemTable;
  InquiryDealerNotification: InquiryDealerNotificationTable;
  PostalCode: PostalCodeTable;
}

export const db = new Kysely<Database>({
  dialect: new MysqlDialect({ pool })
});


