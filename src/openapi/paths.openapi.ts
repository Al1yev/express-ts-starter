import { OpenAPIV3 } from 'openapi-types';
import { errorResponse, productIdParam, successResponse } from './components.openapi';

const SKELETON_NOTE =
    'SKELET: `UserService` metodlari `Not implemented` tashlaydi, `CreateUserDto` esa bo‘sh. ' +
    'Shu sababli hozircha bu endpoint 500 (yoki bo‘sh DTO tufayli 400) qaytaradi. ' +
    'O‘z entity’ingizni shu skelet ustiga yozing.';

const productRef: OpenAPIV3.ReferenceObject = { $ref: '#/components/schemas/Product' };

export const paths: OpenAPIV3.PathsObject = {
    '/health': {
        get: {
            tags: ['health'],
            summary: 'Readiness probe',
            description:
                'DB ulanishi yo‘q bo‘lsa 503 qaytaradi — orkestrator shu status kodiga qarab ' +
                'instansiyani trafikdan chiqaradi.',
            responses: {
                '200': successResponse(
                    'Servis va DB tayyor',
                    { $ref: '#/components/schemas/HealthStatus' },
                    'OK',
                ),
                '503': errorResponse('`Database unavailable` — mongoose ulanmagan'),
            },
        },
    },

    '/products': {
        get: {
            tags: ['products'],
            summary: 'Barcha mahsulotlar',
            responses: {
                '200': successResponse(
                    'Mahsulotlar ro‘yxati',
                    {
                        type: 'array',
                        items: productRef,
                    },
                    'OK',
                ),
            },
        },
        post: {
            tags: ['products'],
            summary: 'Yangi mahsulot yaratish',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateProduct' },
                    },
                },
            },
            responses: {
                '201': successResponse('Yaratildi', productRef, 'created'),
                '400': errorResponse(
                    'Validatsiya xatosi — majburiy maydon yetishmaydi, tip mos emas yoki ' +
                        'sxemada yo‘q begona maydon yuborilgan (mass-assignment himoyasi)',
                ),
            },
        },
    },

    '/products/{id}': {
        parameters: [productIdParam],
        get: {
            tags: ['products'],
            summary: 'Bitta mahsulot',
            responses: {
                '200': successResponse('Topildi', productRef, 'OK'),
                '404': errorResponse("`Product doesn't exist`"),
                '500': errorResponse(
                    'id ObjectId formatiga mos emas — mongoose `CastError` tashlaydi. ' +
                        'Prod’da xabar `Internal server error` ga maskalanadi.',
                ),
            },
        },
        put: {
            tags: ['products'],
            summary: 'Mahsulotni yangilash (qisman)',
            description:
                'Faqat yuborilgan maydonlar tekshiriladi va yangilanadi ' +
                '(`skipMissingProperties = true`). Mongoose `runValidators` bilan ishlaydi.',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateProduct' },
                    },
                },
            },
            responses: {
                '200': successResponse('Yangilandi', productRef, 'updated'),
                '400': errorResponse('Validatsiya xatosi'),
                '404': errorResponse("`Product doesn't exist`"),
            },
        },
        delete: {
            tags: ['products'],
            summary: 'Mahsulotni o‘chirish',
            description:
                'Loyihada `204` ishlatilmaydi — `200` va o‘chirilgan hujjatning o‘zi qaytadi.',
            responses: {
                '200': successResponse('O‘chirildi', productRef, 'deleted'),
                '404': errorResponse("`Product doesn't exist`"),
            },
        },
    },

    '/users': {
        get: {
            tags: ['users'],
            summary: 'Barcha foydalanuvchilar',
            description: SKELETON_NOTE,
            responses: {
                '500': errorResponse('`Not implemented`'),
            },
        },
        post: {
            tags: ['users'],
            summary: 'Yangi foydalanuvchi',
            description: SKELETON_NOTE,
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { type: 'object' } } },
            },
            responses: {
                '400': errorResponse(
                    'Bo‘sh `CreateUserDto` + `forbidNonWhitelisted` tufayli har qanday body rad etiladi',
                ),
                '500': errorResponse('`Not implemented`'),
            },
        },
    },

    '/users/{id}': {
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
            },
        ],
        put: {
            tags: ['users'],
            summary: 'Foydalanuvchini yangilash',
            description: SKELETON_NOTE,
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { type: 'object' } } },
            },
            responses: {
                '400': errorResponse('Bo‘sh DTO tufayli har qanday body rad etiladi'),
                '500': errorResponse('`Not implemented`'),
            },
        },
        delete: {
            tags: ['users'],
            summary: 'Foydalanuvchini o‘chirish',
            description: SKELETON_NOTE,
            responses: {
                '500': errorResponse('`Not implemented`'),
            },
        },
    },
};
