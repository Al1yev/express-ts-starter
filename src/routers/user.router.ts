import { Router } from 'express';
import { Routes } from '@interfaces';
import { UserController } from '@controllers';

export class UserRouter implements Routes {
    public path = '/users';
    public router = Router();
    public user = new UserController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.user.getUsers);
        this.router.post(`${this.path}`, this.user.createUser);
    }
}
