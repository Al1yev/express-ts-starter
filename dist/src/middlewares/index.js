"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get ErrorMiddleware () {
        return _errormiddleware.ErrorMiddleware;
    },
    get ResponseMiddleware () {
        return _responsemiddleware.ResponseMiddleware;
    },
    get ValidationMiddleware () {
        return _validationmiddleware.ValidationMiddleware;
    }
});
const _responsemiddleware = require("./response.middleware");
const _errormiddleware = require("./error.middleware");
const _validationmiddleware = require("./validation.middleware");

//# sourceMappingURL=index.js.map