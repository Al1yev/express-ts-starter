import { App } from './app';
import { VaultClient } from '@/config/vault';
import { UserRouter } from '@routers';

async function bootstrap() {
    try {
        // // Vault
        // const vaultClient = await VaultClient.init();
        // console.log(await VaultClient.getAllSecrets());
        // // ----------------------------------------------

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
