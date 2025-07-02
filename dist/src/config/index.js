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
    get EnvVars () {
        return _envconfig.EnvVars;
    },
    get VaultClient () {
        return _vaultconfig.VaultClient;
    },
    get env () {
        return _envconfig.env;
    }
});
const _envconfig = require("./env.config");
const _vaultconfig = require("./vault.config");

//# sourceMappingURL=index.js.map