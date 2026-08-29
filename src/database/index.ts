import { ConnectionStates, connect, connection, set } from 'mongoose';
import { env } from '@config';

export const dbConnection = async () => {
    const { DB_HOST, DB_PORT, DB_NAME, NODE_ENV } = env;
    const dbConfig = {
        url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`,
    };

    if (NODE_ENV !== 'prod') {
        set('debug', true);
    }

    await connect(dbConfig.url);
    console.log('Successfully connected to Database!');
};

/**
 * Ulanish haqiqatan tayyor-yo'qligi. `readyState` faqat `connected` bo'lganda
 * so'rov bajarish mumkin (`connecting` va `disconnecting` da emas).
 *
 * Ulanish holati shu modulga tegishli, shuning uchun router'lar mongoose'ni
 * to'g'ridan-to'g'ri import qilmasin.
 */
export const isDbConnected = (): boolean => connection.readyState === ConnectionStates.connected;
