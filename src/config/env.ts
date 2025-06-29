import { z } from 'zod';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV}` });

export type TEnv = {
    NODE_ENV: string;
    HOST: string;
    PORT: number;
    DB_HOST?: string;
    DB_PORT?: number;
    DB_NAME?: string;
};

const envSchema = z.object({
    NODE_ENV: z.enum(['dev', 'prod', 'test']),
    HOST: z.string().url(),
    PORT: z.string().regex(/^\d+$/).transform(Number),
    DB_HOST: z.string(),
    DB_PORT: z.string().regex(/^\d+$/).transform(Number),
    DB_NAME: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('[ENV] Invalid environment variables:', parsed.error.format());
    process.exit(1);
}

export const env: TEnv = parsed.data;
