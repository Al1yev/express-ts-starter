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
    get Routes () {
        return _routerinterface.Routes;
    },
    get User () {
        return _userinterface.User;
    }
});
const _routerinterface = require("./router.interface");
const _userinterface = require("./user.interface");

//# sourceMappingURL=index.js.map