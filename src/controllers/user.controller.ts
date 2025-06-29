import { NextFunction, Request, Response } from 'express';
import { UserService } from '@/services';
import { User } from '@/interfaces';
import { HttpException } from '@/exceptions';

export class UserController {
    public user = new UserService();

    public getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const findAllUsersData: User[] | HttpException = await this.user.findAllUser();

            res.status(200).json({ data: findAllUsersData, message: 'findAll' });
        } catch (error) {
            next(error);
        }
    };
}
