import { OpenAPIV3 } from 'openapi-types';
import { env } from '@config';
import { schemas } from './components.openapi';
import { paths } from './paths.openapi';

export const openapiSpec: OpenAPIV3.Document = {
    openapi: '3.0.3',
    info: {
        title: 'express-ts-starter API',
        version: '1.0.0',
        description:
            'Express 5 + TypeScript starter’ning HTTP kontrakti.\n\n' +
            'Barcha javoblar `{ success, message, data }` konvertida qaytadi — ' +
            'yagona istisno `GET /docs/openapi.json` (xom OpenAPI hujjati).\n\n' +
            '`204` ishlatilmaydi: `DELETE` ham `200` va o‘chirilgan hujjatni qaytaradi.',
    },
    servers: [
        {
            url: `${env.HOST}:${env.PORT}`,
            description: `Joriy muhit (${env.NODE_ENV})`,
        },
    ],
    tags: [
        { name: 'health', description: 'Readiness probe' },
        { name: 'products', description: 'To‘liq ishlaydigan namuna entity' },
        { name: 'users', description: 'Ataylab bo‘sh qoldirilgan skelet entity' },
    ],
    components: { schemas },
    paths,
};
