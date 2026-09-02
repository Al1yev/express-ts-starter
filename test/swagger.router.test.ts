import request from 'supertest';
import * as routers from '@routers';
import { SwaggerRouter } from '@routers';
import { openapiSpec } from '@openapi';
import { Routes } from '@interfaces';
import { createTestApp, disconnectTestDb } from './helpers';

/**
 * `/docs` integratsiya testi.
 *
 * Router'lar ATAYLAB `@routers` barrel'idan olinadi — shunda barrel eksporti ham
 * qamrab olinadi (nisbiy yo'l bilan import qilinsa, barrel buzilganini test
 * sezmay qolardi).
 *
 * Endpoint bazaga tegmaydi, lekin `createTestApp()` haqiqiy `App` ni ko'taradi
 * va u `initialize()` da Mongo'ga ulanadi — shu sababli `afterAll` da ulanish
 * yopiladi.
 */

/**
 * Router stack'idan haqiqiy ro'yxatdan o'tgan yo'llarni yig'adi va ularni
 * OpenAPI yozuvi shakliga keltiradi (`/products/:id` → `/products/{id}`).
 *
 * Spesifikatsiyani qo'lda yozilgan ro'yxat bilan solishtirish ma'nosiz bo'lardi —
 * u ham eskirardi. Manba sifatida Express'ning o'z stack'i olinadi.
 */
const collectRoutes = (routers: Routes[]): string[] => {
    const collected: string[] = [];

    for (const entry of routers) {
        const stack = (entry.router as unknown as { stack: any[] }).stack;

        for (const layer of stack) {
            if (!layer.route) continue;

            const suffix: string = layer.route.path === '/' ? '' : layer.route.path;
            const path = `${entry.path}${suffix}`.replace(/:(\w+)/g, '{$1}');
            const methods: string[] = Object.keys(layer.route.methods ?? {}).filter(
                (method) => method !== '_all',
            );

            for (const method of methods) {
                collected.push(`${method} ${path}`);
            }
        }
    }

    return collected.sort();
};

/**
 * Barcha router'lar `@routers` barrel'idan AVTOMATIK olinadi — qo'lda yozilgan
 * ro'yxat yangi router qo'shilganda unutiladigan yana bir ulash nuqtasi bo'lardi.
 *
 * `SwaggerRouter` chetlab o'tiladi: `/docs` — hujjatning o'zi, u o'zini
 * hujjatlamaydi.
 */
const registeredRoutes = (): string[] =>
    collectRoutes(
        Object.entries(routers)
            .filter(([name]) => name !== 'SwaggerRouter')
            .map(([, RouterClass]) => new (RouterClass as new () => Routes)()),
    );

const documentedRoutes = (): string[] =>
    Object.entries(openapiSpec.paths ?? {})
        .flatMap(([path, item]) =>
            Object.keys(item ?? {})
                .filter((key) => key !== 'parameters')
                .map((method) => `${method} ${path}`),
        )
        .sort();

describe('/docs', () => {
    let app: Awaited<ReturnType<typeof createTestApp>>;

    beforeAll(async () => {
        app = await createTestApp([new SwaggerRouter()]);
    });

    afterAll(async () => {
        await disconnectTestDb();
    });

    describe('GET /docs/openapi.json', () => {
        it('200 va xom OpenAPI hujjatini qaytaradi', async () => {
            const res = await request(app).get('/docs/openapi.json');

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/application\/json/);
            expect(res.body.openapi).toBe('3.0.3');
            expect(res.body.info.title).toBe('express-ts-starter API');
        });

        it('`{ success, message, data }` konvertiga o‘ralmaydi', async () => {
            const res = await request(app).get('/docs/openapi.json');

            // Loyihaning javob formati qoidasidan ataylab qilingan yagona istisno:
            // Swagger UI, Postman va codegen spesifikatsiyani standart shaklda kutadi.
            // Konvertga o'ralsa hech bir vosita uni o'qiy olmaydi.
            expect(res.body.success).toBeUndefined();
            expect(res.body.paths).toBeDefined();
        });
    });

    describe('GET /docs', () => {
        it('Swagger UI sahifasini HTML sifatida beradi', async () => {
            const res = await request(app).get('/docs/');

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/text\/html/);
            expect(res.text).toMatch(/swagger-ui/);
        });

        it('CSP sarlavhasi inline skriptga ruxsat beradi', async () => {
            const res = await request(app).get('/docs/');

            // `app.ts` dagi global `helmet()` `script-src 'self'` qo'yadi, Swagger UI esa
            // inline skript bilan ishga tushadi. Ruxsat berilmasa sahifa bo'sh oq chiqadi —
            // bu HTML status kodidan bilinmaydi, shuning uchun sarlavha aniq tekshiriladi.
            expect(res.headers['content-security-policy']).toMatch(/script-src[^;]*unsafe-inline/);
        });
    });

    describe('hujjat kodga mos keladi', () => {
        // Drift-guard. Hujjatning eskirishi jimgina sodir bo'ladigan xato: kod ishlaydi,
        // testlar yashil, faqat hujjat yolg'on gapiradi. Ikki tomonlama tekshiriladi —
        // kodda bor-u hujjatda yo'q endpoint ham, teskarisi ham testni yiqitadi.
        it('ro‘yxatdan o‘tgan har bir route spesifikatsiyada hujjatlangan', () => {
            const routes = registeredRoutes();

            expect(routes.length).toBeGreaterThan(0);
            expect(documentedRoutes()).toEqual(expect.arrayContaining(routes));
        });

        it('spesifikatsiyada kodda yo‘q endpoint qolmagan', () => {
            expect(registeredRoutes()).toEqual(expect.arrayContaining(documentedRoutes()));
        });
    });
});
