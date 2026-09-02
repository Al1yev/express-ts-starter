import { Router, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { Routes } from '@interfaces';
import { openapiSpec } from '@openapi';

const swaggerCsp = helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
    },
});

export class SwaggerRouter implements Routes {
    public path = '/docs';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/openapi.json', (_req: Request, res: Response) => {
            res.json(openapiSpec);
        });

        this.router.use(
            '/',
            swaggerCsp,
            swaggerUi.serve,
            swaggerUi.setup(openapiSpec, {
                customSiteTitle: 'express-ts-starter API',
            }),
        );
    }
}
