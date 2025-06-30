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
});

export const UserModel = model<User & Document>('User', UserSchema);
