import { App } from '@/app';
import { env } from '@config';
import { Routes } from '@interfaces';
import { UserRouter, HealthRouter, ProductRouter, SwaggerRouter } from '@routers';

async function bootstrap() {
    try {
        // Server
        const routes: Routes[] = [new UserRouter(), new HealthRouter(), new ProductRouter()];

        if (env.NODE_ENV !== 'prod') {
            routes.push(new SwaggerRouter());
        }

        const app = new App(routes);
        await app.initialize();
        app.listen();
        // ----------------------------------------------
    } catch (error) {
        console.error('[Bootstrap] Failed to start app:', error);
        process.exit(1);
    }
}

void bootstrap();
