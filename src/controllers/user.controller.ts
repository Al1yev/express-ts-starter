import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { UserService } from '@services';
import { User } from '@interfaces';

export class UserController {
    public user = Container.get(UserService);

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

            res.success(createUserData, 201, 'created');
        } catch (error) {
            next(error);
        }
    };

    public updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const userData: User = req.body;
            const updateUserData: User = await this.user.updateUser(userId, userData);

            res.success(updateUserData, 200, 'updated');
        } catch (error) {
            next(error);
        }
    };

    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const deleteUserData: User = await this.user.deleteUser(userId);

            res.success(deleteUserData, 200, 'deleted');
        } catch (error) {
            next(error);
        }
    };
}
