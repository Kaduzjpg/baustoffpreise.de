import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  DB_HOST: z.string(),
  DB_PORT: z.string().default('13306'),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  CORS_ORIGIN: z.string().url(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  FROM_EMAIL: z.string()
  // Optional: Geocoding API Key
  // GEO_API_KEY: z.string().optional()
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);


