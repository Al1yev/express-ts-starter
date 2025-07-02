"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ValidationMiddleware", {
    enumerable: true,
    get: function() {
        return ValidationMiddleware;
    }
});
const _classtransformer = require("class-transformer");
const _classvalidator = require("class-validator");
const _exceptions = require("../exceptions");
const ValidationMiddleware = (type, skipMissingProperties = false, whitelist = false, forbidNonWhitelisted = false)=>{
    return async (req, res, next)=>{
        const dto = (0, _classtransformer.plainToInstance)(type, req.body);
        try {
            await (0, _classvalidator.validateOrReject)(dto, {
                skipMissingProperties,
                whitelist,
                forbidNonWhitelisted
            });
        } catch (errors) {
            if (Array.isArray(errors)) {
                const message = errors.flatMap((error)=>error.constraints ? Object.values(error.constraints) : []).join(', ');
                return next(new _exceptions.HttpException(400, message));
            } else {
                return next(errors);
            }
        }
        req.body = dto;
        next();
    };
};

//# sourceMappingURL=validation.middleware.js.map