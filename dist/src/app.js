"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "App", {
    enumerable: true,
    get: function() {
        return App;
    }
});
const _express = /*#__PURE__*/ _interop_require_default(require("express"));
const _cors = /*#__PURE__*/ _interop_require_default(require("cors"));
const _helmet = /*#__PURE__*/ _interop_require_default(require("helmet"));
const _compression = /*#__PURE__*/ _interop_require_default(require("compression"));
const _cookieparser = /*#__PURE__*/ _interop_require_default(require("cookie-parser"));
const _config = require("./config");
const _database = require("./database");
const _middlewares = require("./middlewares");
const _utils = require("./utils");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
let App = class App {
    app;
    env;
    port;
    constructor(routes){
        this.app = (0, _express.default)();
        this.port = _config.env.PORT ?? 5000;
        this.env = _config.env.NODE_ENV || 'dev';
        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeRouters(routes);
        this.initializeErrorHandling();
    }
    listen() {
        this.app.listen(this.port, ()=>{
            console.info(`=================================`);
            console.info((0, _utils.padBoth)(` ENV: ${this.env} `, 33, '='));
            console.info(`🚀 App listening on the port ${this.port}`);
            console.info(`=================================`);
        });
    }
    async connectToDatabase() {
        await (0, _database.dbConnection)();
    }
    initializeMiddlewares() {
        this.app.use((0, _cors.default)());
        this.app.use((0, _helmet.default)());
        this.app.use((0, _compression.default)());
        this.app.use(_express.default.json());
        this.app.use(_express.default.urlencoded({
            extended: true
        }));
        this.app.use((0, _cookieparser.default)());
        this.app.use(_middlewares.ResponseMiddleware);
    }
    async initializeRouters(routes) {
        routes.forEach((route)=>{
            this.app.use('/', route.router);
        });
    }
    initializeErrorHandling() {
        this.app.use(_middlewares.ErrorMiddleware);
    }
};

//# sourceMappingURL=app.js.map