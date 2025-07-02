import { NextFunction, Request, Response } from 'express';
import { UserService } from '@services';
import { User } from '@interfaces';

export class UserController {
    public user = new UserService();

    public getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const findAllUsersData: User[] = await this.user.findAllUser();

            res.success(findAllUsersData);
        } catch (error) {
            next(error);
        }
    };

    public createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: User = req.body;
            const createUserData: User = await this.user.createUser(userData);

            res.status(201).json({ data: createUserData, message: 'created' });
        } catch (error) {
            next(error);
        }
    };
}
