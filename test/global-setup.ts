import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Butun test run'i uchun BITTA in-memory MongoDB ko'tariladi.
 *
 * URI `process.env` orqali uzatiladi: Vitest worker'lari `globalSetup` dan KEYIN
 * fork qilinadi, shuning uchun bu yerdagi env o'zgarishlari ularga meros bo'ladi.
 * (`provide()` ishlamaydi — u faqat test tanasida ochiladi, bizga esa qiymat test
 * faylining import bosqichidan oldin kerak.)
 */
let mongo: MongoMemoryServer | undefined;

export async function setup() {
    mongo = await MongoMemoryServer.create();
    process.env.MONGO_TEST_URI = mongo.getUri();
}

export async function teardown() {
    await mongo?.stop();
}
