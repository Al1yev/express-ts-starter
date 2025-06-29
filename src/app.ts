import express from 'express';
import { env } from '@config';
import { ErrorMiddleware } from '@middlewares';
import { Routes } from '@interfaces';
import { dbConnection } from '@database';

export class App {
    public app: express.Application;
    public port: string | number;

    constructor(routes: Routes[]) {
        this.app = express();
        this.port = env.PORT ?? 5000;

        this.connectToDatabase();
        this.initializeRouters(routes);
        this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Server is listening on port: ${this.port}`);
        });
    }

    private async connectToDatabase() {
        await dbConnection();
    }

    private async initializeRouters(routes: Routes[]) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
    }

    public initializeErrorHandling() {
        this.app.use(ErrorMiddleware);
    }
}
