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
    get UserDocument () {
        return _usermodel.UserDocument;
    },
    get UserModel () {
        return _usermodel.UserModel;
    }
});
const _usermodel = require("./user.model");

//# sourceMappingURL=index.js.map