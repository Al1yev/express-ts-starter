import { z } from 'zod';
import { config } from 'dotenv';

const nodeEnv = process.env.NODE_ENV ?? 'dev';

config({ path: `.env.${nodeEnv}` });

const envSchema = z.object({
    NODE_ENV: z.enum(['dev', 'prod', 'test']),
    HOST: z.string().url(),
    PORT: z.string().regex(/^\d+$/).transform(Number),
    DB_HOST: z.string(),
    DB_PORT: z.string().regex(/^\d+$/).transform(Number),
    DB_NAME: z.string(),
});

export type EnvVars = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse({ ...process.env, NODE_ENV: nodeEnv });

if (!parsed.success) {
    console.error('[ENV] Invalid environment variables:', parsed.error.format());
    process.exit(1);
}

export const env: EnvVars = parsed.data;
