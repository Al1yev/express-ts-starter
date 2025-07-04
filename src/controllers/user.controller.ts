import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { UserService } from '@services';
import { User } from '@interfaces';
import { UserDocument } from '@models';

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
            const createUserData: UserDocument = await this.user.createUser(userData);

            res.success(createUserData, 201, 'created');
        } catch (error) {
            next(error);
        }
    };

    public updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const userData: User = req.body;
            const updateUserData: UserDocument = await this.user.updateUser(userId, userData);

            res.success(updateUserData, 200, 'updated');
        } catch (error) {
            next(error);
        }
    };

    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const deleteUserData: UserDocument = await this.user.deleteUser(userId);

            res.success(deleteUserData, 204, 'deleted');
        } catch (error) {
            next(error);
        }
    };
}
