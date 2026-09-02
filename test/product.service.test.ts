import { Container } from 'typedi';
import { ProductService } from '@services';
import { ProductModel } from '@models';
import { HttpException } from '@exceptions';
import { clearTestDb, connectTestDb, disconnectTestDb } from './helpers';

describe('ProductService', () => {
    let service: ProductService;

    beforeAll(async () => {
        await connectTestDb();
        service = Container.get(ProductService);
    });

    afterEach(async () => {
        await clearTestDb();
    });

    afterAll(async () => {
        await disconnectTestDb();
    });

    const payload = { name: 'Mouse', price: 25, manufacturer: 'Logitech' };

    describe('createProduct', () => {
        it('hujjatni maydonlari bilan qaytaradi', async () => {
            const created = await service.createProduct(payload);

            expect(created.name).toBe('Mouse');
            expect(created.price).toBe(25);
            expect(created.manufacturer).toBe('Logitech');
        });

        it('timestamps qo‘shadi', async () => {
            const created = await service.createProduct(payload);

            expect(created.createdAt).toBeInstanceOf(Date);
            expect(created.updatedAt).toBeInstanceOf(Date);
        });

        it('bo‘shliqlarni trim qiladi', async () => {
            const created = await service.createProduct({ ...payload, name: '  Mouse  ' });

            expect(created.name).toBe('Mouse');
        });

        it('manfiy narxni rad etadi', async () => {
            await expect(service.createProduct({ ...payload, price: -1 })).rejects.toThrow();
        });

        it('majburiy maydonsiz rad etadi', async () => {
            await expect(
                service.createProduct({ price: 25, manufacturer: 'Logitech' } as never),
            ).rejects.toThrow();
        });
    });

    describe('findAllProduct', () => {
        it('baza bo‘sh bo‘lsa bo‘sh massiv qaytaradi', async () => {
            await expect(service.findAllProduct()).resolves.toEqual([]);
        });

        it('barcha hujjatlarni qaytaradi', async () => {
            await service.createProduct(payload);
            await service.createProduct({ ...payload, name: 'Keyboard' });

            const products = await service.findAllProduct();

            expect(products).toHaveLength(2);
            expect(products.map((product) => product.name).sort()).toEqual(['Keyboard', 'Mouse']);
        });
    });

    describe('findProductById', () => {
        it('mavjud hujjatni qaytaradi', async () => {
            const created = await service.createProduct(payload);

            const found = await service.findProductById(created.id);

            expect(found.id).toBe(created.id);
            expect(found.name).toBe('Mouse');
        });

        it('topilmasa 404 HttpException tashlaydi', async () => {
            const created = await service.createProduct(payload);
            await ProductModel.findByIdAndDelete(created.id);

            await expect(service.findProductById(created.id)).rejects.toMatchObject({
                status: 404,
                message: "Product doesn't exist",
            });
            await expect(service.findProductById(created.id)).rejects.toBeInstanceOf(HttpException);
        });

        it('noto‘g‘ri formatdagi id uchun CastError tashlaydi', async () => {
            await expect(service.findProductById('not-an-id')).rejects.toThrow(/Cast to ObjectId/);
        });
    });

    describe('updateProduct', () => {
        it('yangilangan hujjatni qaytaradi — eskisini emas', async () => {
            const created = await service.createProduct(payload);

            const updated = await service.updateProduct(created.id, { price: 30 });

            expect(updated.price).toBe(30);
            expect(updated.name).toBe('Mouse');
        });

        it('o‘zgarishni bazaga yozadi', async () => {
            const created = await service.createProduct(payload);
            await service.updateProduct(created.id, { manufacturer: 'Razer' });

            const found = await service.findProductById(created.id);

            expect(found.manufacturer).toBe('Razer');
        });

        it('runValidators ishlaydi — manfiy narx rad etiladi', async () => {
            const created = await service.createProduct(payload);

            await expect(service.updateProduct(created.id, { price: -1 })).rejects.toThrow();
        });

        it('topilmasa 404 HttpException tashlaydi', async () => {
            const created = await service.createProduct(payload);
            await ProductModel.findByIdAndDelete(created.id);

            await expect(service.updateProduct(created.id, { price: 30 })).rejects.toMatchObject({
                status: 404,
            });
        });
    });

    describe('deleteProduct', () => {
        it('o‘chirilgan hujjatni qaytaradi', async () => {
            const created = await service.createProduct(payload);

            const deleted = await service.deleteProduct(created.id);

            expect(deleted.id).toBe(created.id);
        });

        it('hujjatni bazadan olib tashlaydi', async () => {
            const created = await service.createProduct(payload);
            await service.deleteProduct(created.id);

            await expect(service.findAllProduct()).resolves.toEqual([]);
        });

        it('topilmasa 404 HttpException tashlaydi', async () => {
            const created = await service.createProduct(payload);
            await service.deleteProduct(created.id);

            await expect(service.deleteProduct(created.id)).rejects.toMatchObject({ status: 404 });
        });
    });
});
