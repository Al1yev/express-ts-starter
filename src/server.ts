import { App } from '@/app';
import { UserRouter, HealthRouter, ProductRouter } from '@routers';

async function bootstrap() {
    try {
        // Server
        const app = new App([new UserRouter(), new HealthRouter(), new ProductRouter()]);
        await app.initialize();
        app.listen();
        // ----------------------------------------------
    } catch (error) {
        console.error('[Bootstrap] Failed to start app:', error);
        process.exit(1);
    }
}

void bootstrap();
