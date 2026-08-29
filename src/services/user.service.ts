import { Service } from 'typedi';
import { UserDocument } from '@models';
import { User } from '@interfaces';

@Service()
export class UserService {
    public async findAllUser(): Promise<UserDocument[]> {
        throw new Error('Not implemented');
    }

    public async createUser(userData: User): Promise<UserDocument> {
        throw new Error('Not implemented');
    }

    public async findUserById(userId: string): Promise<UserDocument> {
        throw new Error('Not implemented');
    }

    public async updateUser(userId: string, userData: User): Promise<UserDocument> {
        throw new Error('Not implemented');
    }

    public async deleteUser(userId: string): Promise<UserDocument> {
        throw new Error('Not implemented');
    }
}
