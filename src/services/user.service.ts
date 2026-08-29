/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await --
   Skelet: metodlar hali implementatsiya qilinmagan, shuning uchun parametrlar
   ataylab ishlatilmaydi va `async` ichida `await` yo'q. CLAUDE.md ga qarang.
   Logika yozilganda bu qatorni o'chiring. */
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
