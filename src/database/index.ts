import { connect, ConnectOptions, set } from 'mongoose';
import { env } from '@config';

export const dbConnection = async () => {
    const { DB_HOST, DB_PORT, DB_NAME, NODE_ENV } = env;
    const dbConfig = {
        url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    };

    if (NODE_ENV !== 'production') {
        set('debug', true);
    }

    await connect(dbConfig.url);
    console.log('Successfully connected to Database!');
};
