"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ErrorMiddleware", {
    enumerable: true,
    get: function() {
        return ErrorMiddleware;
    }
});
const ErrorMiddleware = (error, req, res, next)=>{
    try {
        const status = error.status || 500;
        const message = error.message || 'Something went wrong';
        console.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
        res.status(status).json({
            success: false,
            message,
            data: null
        });
    } catch (error) {
        next(error);
    }
};

//# sourceMappingURL=error.middleware.js.map