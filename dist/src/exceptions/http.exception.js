"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HttpException", {
    enumerable: true,
    get: function() {
        return HttpException;
    }
});
let HttpException = class HttpException extends Error {
    success;
    status;
    message;
    constructor(status, message){
        super(message);
        this.success = false;
        this.status = status;
        this.message = message;
    }
};

//# sourceMappingURL=http.exception.js.map