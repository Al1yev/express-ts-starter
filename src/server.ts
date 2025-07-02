import { App } from '@/app';
import { UserRouter } from '@routers';

async function bootstrap() {
    try {
        // Server
        const app = new App([new UserRouter()]);
        app.listen();
        // ----------------------------------------------
    } catch (error) {
        console.error('[Bootstrap] Failed to start app:', error);
        process.exit(1);
    }
}

bootstrap();
