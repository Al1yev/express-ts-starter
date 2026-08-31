import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from '@config';
import { Routes } from '@interfaces';
import { dbConnection } from '@database';
import { ErrorMiddleware, ResponseMiddleware } from '@middlewares';
import { HttpException } from '@exceptions';
import { padBoth } from '@utils';

export class App {
    public app: express.Application;
    public env: string;
    public port: number;

    constructor(routes: Routes[]) {
        this.app = express();
        this.port = env.PORT;
        this.env = env.NODE_ENV;

        this.initializeMiddlewares();
        this.initializeRouters(routes);
        this.initializeErrorHandling();
    }

    public async initialize(): Promise<void> {
        await this.connectToDatabase();
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.info(`=================================`);
            console.info(padBoth(` ENV: ${this.env} `, 33, '='));
            console.info(`🚀 App listening on the port ${this.port}`);
            console.info(`=================================`);
        });
    }

    private async connectToDatabase() {
        await dbConnection();
    }

    private initializeMiddlewares() {
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(ResponseMiddleware);
    }

    private initializeRouters(routes: Routes[]) {
        routes.forEach((route) => {
            this.app.use(route.path, route.router);
        });
    }

    public initializeErrorHandling() {
        this.app.use((req, _res, next) =>
            next(new HttpException(404, `Route ${req.originalUrl} not found`)),
        );
        this.app.use(ErrorMiddleware);
    }
}
