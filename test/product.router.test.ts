import request from 'supertest';
import { ProductRouter } from '@routers';
import { clearTestDb, createTestApp, disconnectTestDb } from './helpers';

describe('/products', () => {
    let app: Awaited<ReturnType<typeof createTestApp>>;

    const payload = { name: 'Mouse', price: 25, manufacturer: 'Logitech' };

    const createProduct = async (body: Record<string, unknown> = payload) =>
        request(app).post('/products').send(body);

    beforeAll(async () => {
        app = await createTestApp([new ProductRouter()]);
    });

    afterEach(async () => {
        await clearTestDb();
    });

    afterAll(async () => {
        await disconnectTestDb();
    });

    describe('POST /products', () => {
        it('201 va { success, message: "created", data } qaytaradi', async () => {
            const res = await createProduct();

            expect(res.status).toBe(201);
            expect(Object.keys(res.body).sort()).toEqual(['data', 'message', 'success']);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('created');
        });

        it('data yuborilgan maydonlarni va _id ni o‘z ichiga oladi', async () => {
            const res = await createProduct();

            expect(res.body.data).toMatchObject(payload);
            expect(typeof res.body.data._id).toBe('string');
        });

        it('__v javobda qaytmaydi', async () => {
            const res = await createProduct();

            expect(res.body.data.__v).toBeUndefined();
        });

        it('price yo‘q bo‘lsa 400 qaytaradi', async () => {
            const res = await createProduct({ name: 'Mouse', manufacturer: 'Logitech' });

            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({ success: false, data: null });
        });

        it('price son bo‘lmasa 400 qaytaradi', async () => {
            const res = await createProduct({ ...payload, price: 'yuz' });

            expect(res.status).toBe(400);
        });

        it('manfiy price 400 qaytaradi', async () => {
            const res = await createProduct({ ...payload, price: -1 });

            expect(res.status).toBe(400);
        });

        it('begona maydon 400 qaytaradi (mass-assignment himoyasi)', async () => {
            const res = await createProduct({ ...payload, isAdmin: true });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /products', () => {
        it('bo‘sh bazada bo‘sh massiv qaytaradi', async () => {
            const res = await request(app).get('/products');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ success: true, message: 'OK', data: [] });
        });

        it('yaratilgan mahsulotlarni ro‘yxatda qaytaradi', async () => {
            await createProduct();
            await createProduct({ ...payload, name: 'Keyboard' });

            const res = await request(app).get('/products');

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);
        });
    });

    describe('GET /products/:id', () => {
        it('mavjud mahsulotni 200 bilan qaytaradi', async () => {
            const created = await createProduct();

            const res = await request(app).get(`/products/${created.body.data._id}`);

            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(created.body.data._id);
        });

        it('topilmagan id uchun 404 va xato kontrakti qaytaradi', async () => {
            const created = await createProduct();
            const { _id } = created.body.data;
            await request(app).delete(`/products/${_id}`);

            const res = await request(app).get(`/products/${_id}`);

            expect(res.status).toBe(404);
            expect(res.body).toEqual({
                success: false,
                message: "Product doesn't exist",
                data: null,
            });
        });
    });

    describe('PUT /products/:id', () => {
        it('qisman yangilanishni qabul qiladi va 200 qaytaradi', async () => {
            const created = await createProduct();

            const res = await request(app)
                .put(`/products/${created.body.data._id}`)
                .send({ price: 30 });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('updated');
        });

        it('faqat yuborilgan maydonni o‘zgartiradi', async () => {
            const created = await createProduct();

            const res = await request(app)
                .put(`/products/${created.body.data._id}`)
                .send({ price: 30 });

            expect(res.body.data.price).toBe(30);
            expect(res.body.data.name).toBe('Mouse');
            expect(res.body.data.manufacturer).toBe('Logitech');
        });

        it('yaroqsiz qiymatni 400 bilan rad etadi', async () => {
            const created = await createProduct();

            const res = await request(app)
                .put(`/products/${created.body.data._id}`)
                .send({ price: 'yuz' });

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /products/:id', () => {
        it('204 emas, 200 va o‘chirilgan hujjatni qaytaradi', async () => {
            const created = await createProduct();

            const res = await request(app).delete(`/products/${created.body.data._id}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('deleted');
            expect(res.body.data._id).toBe(created.body.data._id);
        });

        it('o‘chirilgandan keyin GET 404 qaytaradi', async () => {
            const created = await createProduct();
            await request(app).delete(`/products/${created.body.data._id}`);

            const res = await request(app).get(`/products/${created.body.data._id}`);

            expect(res.status).toBe(404);
        });

        it('takroriy o‘chirish 404 qaytaradi', async () => {
            const created = await createProduct();
            await request(app).delete(`/products/${created.body.data._id}`);

            const res = await request(app).delete(`/products/${created.body.data._id}`);

            expect(res.status).toBe(404);
        });
    });
});
