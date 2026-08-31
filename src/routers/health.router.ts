import { Router, Request, Response } from 'express';
import { Routes } from '@interfaces';
import { env } from '@config';
import { isDbConnected } from '@database';
import { HttpException } from '@exceptions';

export class HealthRouter implements Routes {
    public path = '/health';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/', (_req: Request, res: Response) => {
            // Readiness probe: DB'siz bu servis hech qanday foydali ish qila olmaydi,
            // shuning uchun ulanish yo'q bo'lsa `200 ok` qaytarish yolg'on bo'lardi.
            // Orkestrator status kodiga qaraydi - `503` uni trafikdan chiqaradi.
            if (!isDbConnected()) {
                throw new HttpException(503, 'Database unavailable');
            }

            res.success({
                status: 'ok',
                db: 'up',
                uptime: process.uptime(),
                env: env.NODE_ENV,
            });
        });
    }
}
