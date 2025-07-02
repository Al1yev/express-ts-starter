import { model, Schema, Document, HydratedDocument } from 'mongoose';
import { User } from '@interfaces';

export type UserDocument = HydratedDocument<User>;

const UserSchema = new Schema<User & Document>({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});

export const UserModel = model<User & Document>('User', UserSchema);
