"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _app = require("./app");
const _routers = require("./routers");
async function bootstrap() {
    try {
        const app = new _app.App([
            new _routers.UserRouter()
        ]);
        app.listen();
    } catch (error) {
        console.error('[Bootstrap] Failed to start app:', error);
        process.exit(1);
    }
}
bootstrap();

//# sourceMappingURL=server.js.map