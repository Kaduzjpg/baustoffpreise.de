import { z } from 'zod';

const webEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE: z.string().url()
});

export const env = webEnvSchema.parse({
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE
});


