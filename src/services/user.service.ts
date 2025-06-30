import { hash } from 'bcrypt';
import { HttpException } from '@exceptions';
import { User } from '@interfaces';
import { UserDocument, UserModel } from '@models';

export class UserService {
    public async findAllUser(): Promise<UserDocument[] | HttpException> {
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
}
