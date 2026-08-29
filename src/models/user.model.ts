import { model, Schema, HydratedDocument } from 'mongoose';
import { User } from '@interfaces';

export type UserDocument = HydratedDocument<User>;

const UserSchema = new Schema<User>(
    {
        // TODO: define fields
        // Eslatma: maxfiy maydonlar (masalan password) uchun `select: false` ishlating
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

export const UserModel = model<User>('User', UserSchema);
