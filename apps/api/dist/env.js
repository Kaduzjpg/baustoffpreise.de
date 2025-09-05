"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.string().default('3000'),
    DB_HOST: zod_1.z.string(),
    DB_PORT: zod_1.z.string().default('3306'),
    DB_USER: zod_1.z.string(),
    DB_PASS: zod_1.z.string(),
    DB_NAME: zod_1.z.string(),
    CORS_ORIGIN: zod_1.z.string().url(),
    SMTP_HOST: zod_1.z.string(),
    SMTP_PORT: zod_1.z.string().default('587'),
    SMTP_USER: zod_1.z.string(),
    SMTP_PASS: zod_1.z.string(),
    FROM_EMAIL: zod_1.z.string()
    // Optional: Geocoding API Key
    // GEO_API_KEY: z.string().optional()
});
exports.env = envSchema.parse(process.env);
