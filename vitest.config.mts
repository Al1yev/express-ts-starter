import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
    plugins: [
        // Vitest'ning default transformeri (esbuild) `emitDecoratorMetadata` ni
        // QO'LLAB-QUVVATLAMAYDI. Loyiha esa typedi (`@Service()`) va class-validator
        // (`@IsEmail()`) dekoratorlariga tayanadi — default sozlamada testlar sinardi.
        // Yechim: build bilan bir xil `.swcrc` qayta ishlatiladi (u yerda `legacyDecorator`
        // + `decoratorMetadata` yoqilgan), faqat module turi Vite uchun ESM ga o'zgaradi.
        swc.vite({ module: { type: 'es6' } }),
    ],
    // Alias'lar (`@config`, `@models`, ...) test runner'da ham hal bo'lishi shart.
    // Vite 8 dan buni o'zi qiladi — `vite-tsconfig-paths` plugini kerak emas.
    resolve: { tsconfigPaths: true },
    test: {
        globals: true,
        environment: 'node',
        include: ['test/**/*.test.ts'],

        // globalSetup — butun run uchun BITTA mongod ko'taradi.
        // setupFiles — har bir worker'da env'ni to'g'rilaydi (@config import'idan oldin).
        globalSetup: ['./test/global-setup.ts'],
        setupFiles: ['./test/setup.ts'],

        // `forks` — worker'lar `globalSetup` dan keyin fork qilinadi va uning
        // process.env o'zgarishlarini meros oladi.
        pool: 'forks',

        // mongodb-memory-server birinchi ishga tushganda mongod binary'sini yuklaydi.
        hookTimeout: 120000,
        testTimeout: 20000,

        restoreMocks: true,
        coverage: {
            provider: 'v8',
            reportsDirectory: './coverage',
            include: ['src/**/*.ts'],
            exclude: ['src/**/index.ts', 'src/server.ts'],
        },
    },
});
