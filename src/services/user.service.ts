import { HttpException } from '@/exceptions';
import { User } from '@/interfaces';

export class UserService {
    public async findAllUser(): Promise<User[] | HttpException> {
        throw new HttpException(404, 'Bad Request');
        const users: User[] = [];
        return users;
    }
}
