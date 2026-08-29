import type { Application } from 'express';
import mongoose from 'mongoose';
import { App } from '@/app';
import type { Routes } from '@interfaces';

/**
 * Supertest uchun to'liq Express instansiyasini qaytaradi.
 *
 * `app.listen()` ATAYLAB chaqirilmaydi — supertest o'zi vaqtinchalik port ochadi.
 * To'liq app orqali o'tish shart, chunki `res.success()` ni `ResponseMiddleware`
 * qo'shadi va 404 / error kontrakti `app.ts` da yig'iladi; controller'ni yakka
 * chaqirib bu xulqni tekshirib bo'lmaydi.
 */
export const createTestApp = async (routes: Routes[]): Promise<Application> => {
    const app = new App(routes);

    // Mongoose'ning default ulanishi bitta: allaqachon ulangan bo'lsa
    // `initialize()` "openUri() on active connection" xatosini beradi.
    if (mongoose.connection.readyState === 0) {
        await app.initialize();
        mongoose.set('debug', false);
    }

    return app.app;
};
