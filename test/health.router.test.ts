import request from 'supertest';
import mongoose from 'mongoose';
import { HealthRouter } from '@routers';
import { connectTestDb, createTestApp, disconnectTestDb } from './helpers';

/**
 * `GET /health` integratsiya testi.
 *
 * `HealthRouter` ATAYLAB `@routers` barrel'idan olinadi — shunda barrel eksporti
 * ham qamrab olinadi (nisbiy yo'l bilan import qilinsa, barrel buzilganini test
 * sezmay qolardi).
 *
 * Endpoint bazaga tegmaydi, shuning uchun `clearTestDb()` kerak emas; lekin
 * `createTestApp()` haqiqiy `App` ni ko'taradi va u `initialize()` da Mongo'ga
 * ulanadi — shu sababli `afterAll` da ulanish yopiladi.
 */

describe('GET /health', () => {
    let app: Awaited<ReturnType<typeof createTestApp>>;

    beforeAll(async () => {
        app = await createTestApp([new HealthRouter()]);
    });

    afterAll(async () => {
        await disconnectTestDb();
    });

    it('200 va JSON javob qaytaradi', async () => {
        const res = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('javob { success, message, data } kontraktiga mos keladi', async () => {
        const res = await request(app).get('/health');

        expect(Object.keys(res.body).sort()).toEqual(['data', 'message', 'success']);
        expect(res.body.success).toBe(true);
        // `res.success()` ning default'lari: 200 / 'OK'.
        expect(res.body.message).toBe('OK');
    });

    it('data.status "ok" va data.db "up" bo‘ladi', async () => {
        const res = await request(app).get('/health');

        expect(res.body.data.status).toBe('ok');
        expect(res.body.data.db).toBe('up');
    });

    it('data.env joriy muhitni aks ettiradi (test muhitida "test")', async () => {
        const res = await request(app).get('/health');

        expect(res.body.data.env).toBe('test');
    });

    it('data.uptime musbat son bo‘ladi', async () => {
        const res = await request(app).get('/health');

        const { uptime } = res.body.data;

        // Aniq qiymatga bog‘lanmaymiz — u har chaqiruvda o‘zgaradi.
        expect(typeof uptime).toBe('number');
        expect(Number.isNaN(uptime)).toBe(false);
        expect(Number.isFinite(uptime)).toBe(true);
        expect(uptime).toBeGreaterThan(0);
    });

    it('uptime har so‘rovda qaytadan hisoblanadi (kesh qilinmaydi)', async () => {
        const first = await request(app).get('/health');
        const second = await request(app).get('/health');

        // `process.uptime()` monoton o‘sadi: ikkinchi qiymat birinchisidan kichik
        // bo‘lsa — javob qotib qolgan yoki noto‘g‘ri manbadan olingan.
        expect(second.body.data.uptime).toBeGreaterThanOrEqual(first.body.data.uptime);
    });

    it('POST /health uchun route yo‘q — 404 va xato kontrakti qaytadi', async () => {
        const res = await request(app).post('/health').send({});

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            success: false,
            message: 'Route /health not found',
            data: null,
        });
    });

    it('/health/status kabi ichki yo‘l ro‘yxatdan o‘tmagan — 404', async () => {
        const res = await request(app).get('/health/status');

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.data).toBeNull();
    });

    describe('DB uzilgan holatda', () => {
        // Mock emas, HAQIQIY uzilish: readiness probe'ning butun ma'nosi
        // mongoose'ning haqiqiy holatini aks ettirishida. Mock qo'yilsa test
        // implementatsiyaga emas, o'z soxta holatiga bog'lanib qolardi.
        beforeAll(async () => {
            await mongoose.disconnect();
        });

        afterAll(async () => {
            await connectTestDb();
        });

        it('503 qaytaradi — `200 ok` emas', async () => {
            const res = await request(app).get('/health');

            expect(res.status).toBe(503);
        });

        it('loyihaning xato kontraktiga mos keladi', async () => {
            const res = await request(app).get('/health');

            expect(res.body).toEqual({
                success: false,
                message: 'Database unavailable',
                data: null,
            });
        });
    });
});
