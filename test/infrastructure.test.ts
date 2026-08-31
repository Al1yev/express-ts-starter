import { Router } from 'express';
import request from 'supertest';
import mongoose, { ConnectionStates } from 'mongoose';
import { Container, Service } from 'typedi';
import { IsEmail } from 'class-validator';
import { env } from '@config';
import { HttpException } from '@exceptions';
import { ValidationMiddleware } from '@middlewares';
import type { Routes } from '@interfaces';
import { clearTestDb, createTestApp, disconnectTestDb } from './helpers';

/**
 * Test INFRATUZILMASINING o'zini tekshiradi, domen logikasini emas.
 *
 * Bu fayl loyihaning skelet holatiga bog'liq emas (`UserService` metodlari ataylab
 * `Not implemented`), shuning uchun u yerda logika paydo bo'lganda ham o'zgarmaydi.
 * Agar shu fayl yiqilsa — muammo testda emas, test muhitida.
 */

// --- Dekorator metadatasini isbotlash uchun probe'lar -------------------------

@Service()
class ProbeDependency {
    public readonly value = 'injected';
}

@Service()
class ProbeService {
    // Konstruktor orqali inyeksiya `design:paramtypes` metadatasiga tayanadi.
    // `emitDecoratorMetadata` ishlamasa typedi bu yerga `undefined` uzatadi.
    constructor(private readonly dependency: ProbeDependency) {}

    public read(): string {
        return this.dependency.value;
    }
}

class ProbeDto {
    @IsEmail()
    public email!: string;
}

// Modul darajasida ro'yxatdan o'tkaziladi — test ichida yaratilsa, testlar
// bir-biriga tartib orqali bog'lanib qolardi (`--sequence.shuffle` da yiqilardi).
const ProbeModel = mongoose.model('Probe', new mongoose.Schema({ tag: String }));

class ProbeRouter implements Routes {
    public path = '/__probe';
    public router = Router();

    constructor() {
        this.router.get('/ok', (_req, res) => {
            res.success({ injected: Container.get(ProbeService).read() });
        });

        this.router.post('/dto', ValidationMiddleware(ProbeDto), (req, res) => {
            res.success(req.body);
        });

        this.router.get('/http-error', () => {
            throw new HttpException(418, 'I am a teapot');
        });

        this.router.get('/boom', () => {
            throw new Error('kutilmagan ichki xato');
        });
    }
}

// --- Testlar -----------------------------------------------------------------

describe('test infratuzilmasi', () => {
    let app: Awaited<ReturnType<typeof createTestApp>>;

    beforeAll(async () => {
        app = await createTestApp([new ProbeRouter()]);
    });

    afterEach(async () => {
        await clearTestDb();
    });

    afterAll(async () => {
        await disconnectTestDb();
    });

    describe('muhit', () => {
        it('NODE_ENV=test da env validatsiyasi jarayonni o‘ldirmaydi', () => {
            expect(env.NODE_ENV).toBe('test');
            expect(env.HOST).toBe('http://localhost');
        });

        it('bazani in-memory serverga va worker‘ga xos nomga yo‘naltiradi', () => {
            expect(env.DB_NAME).toBe(`test_${process.pid}`);
            expect(env.DB_PORT).not.toBe(27017);
        });
    });

    describe('dekorator metadatasi (unplugin-swc)', () => {
        it('typedi konstruktor inyeksiyasini hal qiladi', () => {
            expect(Container.get(ProbeService).read()).toBe('injected');
        });

        it('class-validator dekoratori aniq xabar beradi', async () => {
            const res = await request(app).post('/__probe/dto').send({ email: 'not-an-email' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('email must be an email');
        });
    });

    describe('mongodb-memory-server', () => {
        it('ulangan va yozib-o‘qiy oladi', async () => {
            expect(mongoose.connection.readyState).toBe(ConnectionStates.connected);

            await ProbeModel.create({ tag: 'salom' });

            await expect(ProbeModel.countDocuments()).resolves.toBe(1);
        });

        it('har testdan keyin baza tozalanadi', async () => {
            await expect(ProbeModel.countDocuments()).resolves.toBe(0);
        });
    });

    describe('javob kontrakti to‘liq app orqali', () => {
        it('res.success() { success, message, data } beradi', async () => {
            const res = await request(app).get('/__probe/ok');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                message: 'OK',
                data: { injected: 'injected' },
            });
        });

        it('noma’lum route JSON formatda 404 qaytaradi', async () => {
            const res = await request(app).get('/bunday-route-yoq');

            expect(res.status).toBe(404);
            expect(res.body).toEqual({
                success: false,
                message: 'Route /bunday-route-yoq not found',
                data: null,
            });
        });

        it('HttpException status va xabarni o‘tkazadi', async () => {
            const res = await request(app).get('/__probe/http-error');

            expect(res.status).toBe(418);
            expect(res.body.message).toBe('I am a teapot');
        });

        it('kutilmagan xato 500 bo‘ladi, test muhitida esa asl xabar ko‘rinadi', async () => {
            const res = await request(app).get('/__probe/boom');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('kutilmagan ichki xato');
        });
    });
});
