"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ResponseMiddleware", {
    enumerable: true,
    get: function() {
        return ResponseMiddleware;
    }
});
const ResponseMiddleware = (req, res, next)=>{
    res.success = (data, statusCode = 200, message = 'OK')=>{
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    };
    next();
};

//# sourceMappingURL=response.middleware.js.map