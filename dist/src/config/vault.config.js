"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VaultClient", {
    enumerable: true,
    get: function() {
        return VaultClient;
    }
});
const _nodevault = /*#__PURE__*/ _interop_require_default(require("node-vault"));
const _dotenv = require("dotenv");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
(0, _dotenv.config)({
    path: `.env.${process.env.NODE_ENV}`
});
let VaultClient = class VaultClient {
    static client;
    static path = 'test-app';
    static address = process.env.VAULT_ADDR ?? 'http://127.0.0.1:8200';
    static secretID = process.env.VAULT_SECRET_ID;
    static roleID = process.env.VAULT_ROLE_ID;
    static async init() {
        try {
            this.client = (0, _nodevault.default)({
                endpoint: this.address
            });
            const loginResponse = await this.client.approleLogin({
                role_id: this.roleID,
                secret_id: this.secretID
            });
            this.client.token = loginResponse.auth.client_token;
            console.log('[Vault] AppRole login successful');
        } catch (error) {
            console.error('[Vault] Failed to create client:', error);
            throw error;
        }
    }
    static async getAllSecrets(path = this.path) {
        try {
            const secret = await this.client.read('secret/data/test-app');
            console.log(secret);
            return secret;
        } catch (error) {
            console.log(error);
            console.error('[Vault] Failed to read secret:', error);
            throw error;
        }
    }
};

//# sourceMappingURL=vault.config.js.map