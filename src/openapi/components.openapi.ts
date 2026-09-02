import { OpenAPIV3 } from 'openapi-types';

export const schemas: Record<string, OpenAPIV3.SchemaObject> = {
    Product: {
        type: 'object',
        required: ['_id', 'name', 'price', 'manufacturer', 'createdAt', 'updatedAt'],
        properties: {
            _id: {
                type: 'string',
                description: 'MongoDB ObjectId',
                example: '66b1f4c2e13a4b0012a9c777',
            },
            name: { type: 'string', maxLength: 200, example: 'Mexanik klaviatura' },
            price: { type: 'number', minimum: 0, example: 349.99 },
            manufacturer: { type: 'string', maxLength: 200, example: 'Keychron' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
        },
    },

    CreateProduct: {
        type: 'object',
        required: ['name', 'price', 'manufacturer'],
        additionalProperties: false,
        properties: {
            name: { type: 'string', minLength: 1, maxLength: 200, example: 'Mexanik klaviatura' },
            price: { type: 'number', minimum: 0, example: 349.99 },
            manufacturer: { type: 'string', minLength: 1, maxLength: 200, example: 'Keychron' },
        },
    },

    UpdateProduct: {
        type: 'object',
        additionalProperties: false,
        description:
            'Qisman yangilash: yuborilgan maydonlargina tekshiriladi. Begona maydon 400 beradi.',
        properties: {
            name: { type: 'string', minLength: 1, maxLength: 200, example: 'Yangi nom' },
            price: { type: 'number', minimum: 0, example: 299 },
            manufacturer: { type: 'string', minLength: 1, maxLength: 200, example: 'Logitech' },
        },
    },

    HealthStatus: {
        type: 'object',
        required: ['status', 'db', 'uptime', 'env'],
        properties: {
            status: { type: 'string', enum: ['ok'] },
            db: { type: 'string', enum: ['up'] },
            uptime: { type: 'number', description: 'process.uptime() — sekundlarda' },
            env: { type: 'string', enum: ['dev', 'prod', 'test'] },
        },
    },

    SuccessEnvelope: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
            success: { type: 'boolean', enum: [true] },
            message: { type: 'string', example: 'OK' },
            data: {},
        },
    },

    ErrorEnvelope: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
            success: { type: 'boolean', enum: [false] },
            message: { type: 'string', example: "Product doesn't exist" },
            data: { type: 'object', nullable: true },
        },
    },
};

export const successResponse = (
    description: string,
    dataSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    message: string,
): OpenAPIV3.ResponseObject => ({
    description,
    content: {
        'application/json': {
            schema: {
                allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                        type: 'object',
                        properties: {
                            message: { type: 'string', enum: [message] },
                            data: dataSchema,
                        },
                    },
                ],
            },
        },
    },
});

export const errorResponse = (description: string): OpenAPIV3.ResponseObject => ({
    description,
    content: {
        'application/json': {
            schema: { $ref: '#/components/schemas/ErrorEnvelope' },
        },
    },
});

export const productIdParam: OpenAPIV3.ParameterObject = {
    name: 'id',
    in: 'path',
    required: true,
    description: 'Mahsulotning MongoDB ObjectId qiymati',
    schema: { type: 'string', example: '66b1f4c2e13a4b0012a9c777' },
};
