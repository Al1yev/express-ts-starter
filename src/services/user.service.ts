import { hash } from 'bcrypt';
import { HttpException } from '@exceptions';
import { User } from '@interfaces';
import { UserDocument, UserModel } from '@models';
import { Service } from 'typedi';

@Service()
export class UserService {
    public async findAllUser(): Promise<UserDocument[]> {
        const users: UserDocument[] = await UserModel.find();
        return users;
    }

    public async createUser(userData: User): Promise<UserDocument> {
        const findUser: UserDocument | null = await UserModel.findOne({ email: userData.email });
        if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

        const hashedPassword = await hash(userData.password, 10);
        const createUserData: UserDocument = await UserModel.create({
            ...userData,
            password: hashedPassword,
        });

        return createUserData;
    }

    public async findUserById(userId: string): Promise<UserDocument> {
        const findUser: UserDocument | null = await UserModel.findOne({ _id: userId });
        if (!findUser) throw new HttpException(409, "User doesn't exist");

        return findUser;
    }

    public async updateUser(userId: string, userData: User): Promise<UserDocument> {
        if (userData.email) {
            const findUser: UserDocument = await UserModel.findOne({ email: userData.email });
            if (findUser && findUser._id != userId)
                throw new HttpException(409, `This email ${userData.email} already exists`);
        }

        if (userData.password) {
            const hashedPassword = await hash(userData.password, 10);
            userData = { ...userData, password: hashedPassword };
        }

        const updateUserById: UserDocument = await UserModel.findByIdAndUpdate(userId, userData);
        if (!updateUserById) throw new HttpException(409, "User doesn't exist");

        return updateUserById;
    }

    public async deleteUser(userId: string): Promise<UserDocument> {
        const deleteUserById: UserDocument = await UserModel.findByIdAndDelete(userId);
        if (!deleteUserById) throw new HttpException(409, "User doesn't exist");

        return deleteUserById;
    }
}
