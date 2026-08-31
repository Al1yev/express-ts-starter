import { Router } from 'express';
import { Routes } from '@interfaces';
import { UserController } from '@controllers';
import { ValidationMiddleware } from '@middlewares';
import { CreateUserDto } from '@dtos';

export class UserRouter implements Routes {
    public path = '/users';
    public router = Router();
    public user = new UserController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/', this.user.getUsers);
        this.router.post('/', ValidationMiddleware(CreateUserDto), this.user.createUser);
        this.router.put('/:id', ValidationMiddleware(CreateUserDto, true), this.user.updateUser);
        this.router.delete('/:id', this.user.deleteUser);
    }
}
