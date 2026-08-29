import { Router } from 'express';
import request from 'supertest';
import type { MockInstance } from 'vitest';
import { env } from '@config';
import { HttpException } from '@exceptions';
import type { Routes } from '@interfaces';
import { clearTestDb, createTestApp, disconnectTestDb } from './helpers';

/**
 * `ErrorMiddleware` — loyihaning eng muhim xavfsizlik chegarasi.
 *
 * `env.NODE_ENV` `@config` da modul yuklanganda BIR MARTA hisoblanadi, shuning uchun
 * prod xulqini `process.env.NODE_ENV` ni o'zgartirib tekshirib bo'lmaydi. Yechim:
 * `@config` moduli mock qilinadi va `env.NODE_ENV` getter orqali test ichida
 * almashtiriladi. Qolgan barcha qiymatlar (DB_*, PORT, HOST) haqiqiy — shu tufayli
 * `createTestApp()` in-memory Mongo'ga odatdagidek ulanaveradi.
 *
 * Middleware `env.NODE_ENV` ni har so'rovda o'qiydi, shuning uchun bitta app bilan
 * turli muhitlarni sinash mumkin.
 */
const envOverride = vi.hoisted(() => ({ nodeEnv: 'test' }));

// DIQQAT: bu yerda '@config' alias'i ISHLAMAYDI. Haqiqiy import'lardagi alias'ni
// swc (`.swcrc` dagi `jsc.paths`) nisbiy yo'lga aylantiradi, `vi.mock()` ning satr
// argumenti esa o'sha-o'shaligicha qoladi va `test/` ichidan hal bo'lmaydi —
// mock jimgina e'tiborsiz qolardi. Shuning uchun modul nisbiy yo'l bilan ko'rsatiladi;
// natijada u `src/` ichidagi `@config` import'lari bilan bir xil modulga tushadi.
vi.mock('../src/config/index.ts', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@config')>();

    return {
        ...actual,
        env: {
            ...actual.env,
            get NODE_ENV() {
                return envOverride.nodeEnv;
            },
        },
    };
});

const SECRET_MESSAGE = 'mongodb://admin:super-secret-parol@10.0.0.5/prod-db ulanmadi';

class ErrorProbeRouter implements Routes {
    public router = Router();

    constructor() {
        this.router.get('/err/forbidden', () => {
            throw new HttpException(403, 'Ruxsat yo‘q: token eskirgan');
        });

        this.router.get('/err/service-unavailable', () => {
            throw new HttpException(503, 'To‘lov provayderi javob bermadi');
        });

        this.router.get('/err/unexpected', () => {
            throw new Error(SECRET_MESSAGE);
        });

        this.router.get('/err/unexpected-async', async () => {
            await Promise.resolve();
            throw new TypeError(SECRET_MESSAGE);
        });

        this.router.get('/err/non-error', (_req, _res, next) => {
            // Error bo'lmagan qiymat ham error handler'ga tushishi mumkin.
            next({ internal: SECRET_MESSAGE });
        });
    }
}

describe('ErrorMiddleware', () => {
    let app: Awaited<ReturnType<typeof createTestApp>>;
    let consoleError: MockInstance<typeof console.error>;

    beforeAll(async () => {
        app = await createTestApp([new ErrorProbeRouter()]);
    });

    beforeEach(() => {
        // Middleware ataylab log yozadi — test chiqishini iflos qilmasin,
        // lekin log qilinganini tekshirish imkoni qolsin.
        consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        envOverride.nodeEnv = 'test';
    });

    afterEach(async () => {
        await clearTestDb();
    });

    afterAll(async () => {
        await disconnectTestDb();
    });

    it('mock env NODE_ENV ni test ichida almashtira oladi', () => {
        // Agar bu ishlamasa, quyidagi "prod" testlari aslida test muhitida
        // ishlab, bekorga yashil bo'lib qolardi.
        expect(env.NODE_ENV).toBe('test');

        envOverride.nodeEnv = 'prod';
        expect(env.NODE_ENV).toBe('prod');
    });

    describe('HttpException', () => {
        it('status va xabarni o‘zgarishsiz client‘ga uzatadi', async () => {
            const res = await request(app).get('/err/forbidden');

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Ruxsat yo‘q: token eskirgan');
        });

        it('javobni { success, message, data } shaklida beradi', async () => {
            const res = await request(app).get('/err/forbidden');

            expect(res.body).toEqual({
                success: false,
                message: 'Ruxsat yo‘q: token eskirgan',
                data: null,
            });
        });

        it('JSON content-type qaytaradi', async () => {
            const res = await request(app).get('/err/forbidden');

            expect(res.headers['content-type']).toMatch(/application\/json/);
        });

        it('operatsion xato uchun stack‘ni log qilmaydi', async () => {
            await request(app).get('/err/forbidden');

            expect(consoleError).toHaveBeenCalledTimes(1);
            expect(consoleError.mock.calls[0][0]).toContain('StatusCode:: 403');
        });
    });

    describe('kutilmagan xatolar', () => {
        it('HttpException bo‘lmagan xatoni 500 ga aylantiradi', async () => {
            const res = await request(app).get('/err/unexpected');

            expect(res.status).toBe(500);
        });

        it('test muhitida haqiqiy xabarni ko‘rsatadi', async () => {
            const res = await request(app).get('/err/unexpected');

            expect(res.body).toEqual({
                success: false,
                message: SECRET_MESSAGE,
                data: null,
            });
        });

        it('dev muhitida ham haqiqiy xabarni ko‘rsatadi', async () => {
            envOverride.nodeEnv = 'dev';

            const res = await request(app).get('/err/unexpected');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe(SECRET_MESSAGE);
        });

        it('async handler‘dagi rejection ham ushlanadi (Express 5)', async () => {
            const res = await request(app).get('/err/unexpected-async');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe(SECRET_MESSAGE);
        });

        it('Error bo‘lmagan qiymat uchun "Unexpected error" beradi', async () => {
            const res = await request(app).get('/err/non-error');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Unexpected error');
        });

        it('Error bo‘lmagan qiymatning ichini javobga qo‘shmaydi', async () => {
            const res = await request(app).get('/err/non-error');

            expect(res.text).not.toContain('super-secret-parol');
        });

        it('javobda stack yoki qo‘shimcha maydonlar bo‘lmaydi', async () => {
            const res = await request(app).get('/err/unexpected');

            expect(Object.keys(res.body).sort()).toEqual(['data', 'message', 'success']);
            expect(res.text).not.toContain('at ');
        });

        it('stack‘ni serverda logga yozadi', async () => {
            await request(app).get('/err/unexpected');

            const logged = consoleError.mock.calls.map((call) => String(call[0])).join('\n');

            expect(consoleError).toHaveBeenCalledTimes(2);
            expect(logged).toContain('StatusCode:: 500');
            expect(logged).toContain('at ');
        });
    });

    describe('prod muhitida ichki tafsilotlar oshkor bo‘lmaydi', () => {
        beforeEach(() => {
            envOverride.nodeEnv = 'prod';
        });

        it('kutilmagan xato o‘rniga "Internal server error" beradi', async () => {
            const res = await request(app).get('/err/unexpected');

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                success: false,
                message: 'Internal server error',
                data: null,
            });
        });

        it('javobning hech bir joyida ichki xabar qolmaydi', async () => {
            const res = await request(app).get('/err/unexpected');

            expect(res.text).not.toContain('super-secret-parol');
            expect(res.text).not.toContain('10.0.0.5');
            expect(res.text).not.toContain('mongodb://');
        });

        it('async kutilmagan xatoni ham maskalaydi', async () => {
            const res = await request(app).get('/err/unexpected-async');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Internal server error');
        });

        it('maskalasa ham haqiqiy xabar va stack serverda logda qoladi', async () => {
            await request(app).get('/err/unexpected');

            const logged = consoleError.mock.calls.map((call) => String(call[0])).join('\n');

            expect(logged).toContain(SECRET_MESSAGE);
            expect(logged).toContain('at ');
        });

        it('4xx HttpException xabari maskalanmaydi', async () => {
            const res = await request(app).get('/err/forbidden');

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Ruxsat yo‘q: token eskirgan');
        });

        it('404 kontrakti prod‘da ham o‘zgarmaydi', async () => {
            const res = await request(app).get('/mavjud-emas');

            expect(res.status).toBe(404);
            expect(res.body).toEqual({
                success: false,
                message: 'Route /mavjud-emas not found',
                data: null,
            });
        });

        it('5xx HttpException xabari maskalanmaydi — u ataylab tashlangan', async () => {
            // Maskalash sharti `status >= 500` emas, `!isHttpException`. `HttpException`
            // operatsion xato: xabari client uchun yozilgan, shuning uchun 5xx da ham
            // o'zgarmasdan boradi. Faqat KUTILMAGAN xatolar maskalanadi.
            const res = await request(app).get('/err/service-unavailable');

            expect(res.status).toBe(503);
            expect(res.body.message).toBe('To‘lov provayderi javob bermadi');
        });

        it('maskalash faqat kutilmagan xatoga tegishli, HttpException’ga emas', async () => {
            // Ikkalasi ham 5xx, lekin natija har xil bo'lishi shart.
            const operational = await request(app).get('/err/service-unavailable');
            const unexpected = await request(app).get('/err/unexpected');

            expect(operational.status).toBe(503);
            expect(unexpected.status).toBe(500);
            expect(operational.body.message).not.toBe('Internal server error');
            expect(unexpected.body.message).toBe('Internal server error');
            expect(unexpected.body.message).not.toContain('super-secret-parol');
        });
    });

    describe('prod bo‘lmagan muhitda 5xx HttpException', () => {
        it('o‘z xabarini saqlaydi', async () => {
            const res = await request(app).get('/err/service-unavailable');

            expect(res.status).toBe(503);
            expect(res.body.message).toBe('To‘lov provayderi javob bermadi');
        });
    });
});
