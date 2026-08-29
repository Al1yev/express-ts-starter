import { App } from '@/app';
import { UserRouter, HealthRouter } from '@routers';

async function bootstrap() {
    try {
        // Server
        const app = new App([new UserRouter(), new HealthRouter()]);
        await app.initialize();
        app.listen();
        // ----------------------------------------------
    } catch (error) {
        console.error('[Bootstrap] Failed to start app:', error);
        process.exit(1);
    }
}

bootstrap();
