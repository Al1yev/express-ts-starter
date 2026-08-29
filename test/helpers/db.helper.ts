import mongoose from 'mongoose';
import { dbConnection } from '@database';

/**
 * In-memory Mongo'ga ulanadi. Idempotent — bir necha marta chaqirsa bo'ladi.
 *
 * Ataylab loyihaning haqiqiy `dbConnection()` i ishlatiladi: shu tufayli
 * testlar `@config` → URL yig'ilishi → `mongoose.connect` yo'lini ham qamraydi.
 */
export const connectTestDb = async (): Promise<void> => {
    if (mongoose.connection.readyState !== 0) return;

    await dbConnection();
    // `dbConnection()` prod'dan boshqa muhitda `set('debug', true)` qiladi —
    // test chiqishida har bir so'rov ko'rinib ketmasligi uchun o'chiramiz.
    mongoose.set('debug', false);
};

/** Har bir testdan keyin chaqiring — testlar bir-biridan mustaqil bo'lishi shart. */
export const clearTestDb = async (): Promise<void> => {
    if (mongoose.connection.readyState === 0) return;

    const collections = Object.values(mongoose.connection.collections);
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
};

/** Test faylining oxirida. Bazani tashlab, ulanishni yopadi. */
export const disconnectTestDb = async (): Promise<void> => {
    if (mongoose.connection.readyState === 0) return;

    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
};
