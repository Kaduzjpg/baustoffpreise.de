import { z } from 'zod';

const webEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE: z.string().url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional()
});

export const env = webEnvSchema.parse({
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN
});


