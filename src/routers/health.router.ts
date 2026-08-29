import { Router, Request, Response } from 'express';
import { Routes } from '@interfaces';
import { env } from '@config';

export class HealthRouter implements Routes {
    public path = '/health';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, (_req: Request, res: Response) => {
            res.success({
                status: 'ok',
                uptime: process.uptime(),
                env: env.NODE_ENV,
            });
        });
    }
}
