import 'reflect-metadata';

/**
 * Har bir Vitest worker'ida test fayllaridan OLDIN ishlaydi.
 *
 * Vazifasi — `@config` import qilinishidan oldin `process.env` ni to'g'rilash.
 * `src/config/env.config.ts` modul yuklanganda zod bilan validatsiya qiladi va
 * xato bo'lsa `process.exit(1)` qiladi, ya'ni test jim o'ladi. dotenv mavjud
 * process.env o'zgaruvchisini almashtirmaydi, shuning uchun bu yerda qo'yilgan
 * DB_* qiymatlari `.env.test` dagilardan ustun turadi.
 *
 * Bu yerda `await` ishlatilmaydi (top-level await CommonJS target'da tsc'dan
 * o'tmaydi), shuning uchun mongod'ni `test/global-setup.ts` ko'taradi.
 */
process.env.NODE_ENV = 'test';

const uri = process.env.MONGO_TEST_URI;

if (!uri) {
    throw new Error(
        'MONGO_TEST_URI yo‘q. Testlarni `npm test` orqali ishga tushiring — ' +
            'in-memory MongoDB `vitest.config` dagi globalSetup da ko‘tariladi.',
    );
}

const { hostname, port } = new URL(uri);

process.env.DB_HOST = hostname;
process.env.DB_PORT = port;
// Har bir worker o'z bazasida ishlaydi — parallel test fayllari bir-birining
// hujjatlarini ko'rmaydi va `clearTestDb()` qo'shni testni buzmaydi.
process.env.DB_NAME = `test_${process.pid}`;
