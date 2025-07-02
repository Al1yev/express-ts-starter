"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "dbConnection", {
    enumerable: true,
    get: function() {
        return dbConnection;
    }
});
const _mongoose = require("mongoose");
const _config = require("../config");
const dbConnection = async ()=>{
    const { DB_HOST, DB_PORT, DB_NAME, NODE_ENV } = _config.env;
    const dbConfig = {
        url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    };
    if (NODE_ENV !== 'prod') {
        (0, _mongoose.set)('debug', true);
    }
    await (0, _mongoose.connect)(dbConfig.url);
    console.log('Successfully connected to Database!');
};

//# sourceMappingURL=index.js.map