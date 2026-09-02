import { model, Schema, HydratedDocument } from 'mongoose';
import { Product } from '@interfaces';

export type ProductDocument = HydratedDocument<Product>;

const ProductSchema = new Schema<Product>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        manufacturer: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.__v;
                return ret;
            },
        },
    },
);

export const ProductModel = model<Product>('Product', ProductSchema);
