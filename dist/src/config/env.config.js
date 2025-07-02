"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "env", {
    enumerable: true,
    get: function() {
        return env;
    }
});
const _zod = require("zod");
const _dotenv = require("dotenv");
(0, _dotenv.config)({
    path: `.env.${process.env.NODE_ENV}`
});
const envSchema = _zod.z.object({
    NODE_ENV: _zod.z.enum([
        'dev',
        'prod',
        'test'
    ]),
    HOST: _zod.z.string().url(),
    PORT: _zod.z.string().regex(/^\d+$/).transform(Number),
    DB_HOST: _zod.z.string(),
    DB_PORT: _zod.z.string().regex(/^\d+$/).transform(Number),
    DB_NAME: _zod.z.string()
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('[ENV] Invalid environment variables:', parsed.error.format());
    process.exit(1);
}
const env = parsed.data;

//# sourceMappingURL=env.config.js.map