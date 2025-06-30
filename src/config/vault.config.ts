import vault, { client, Option } from 'node-vault';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV}` });

export class VaultClient {
    public static client: ReturnType<typeof vault>;
    public static readonly path = 'test-app';
    public static readonly address: string = process.env.VAULT_ADDR ?? 'http://127.0.0.1:8200';
    public static readonly secretID: string | undefined = process.env.VAULT_SECRET_ID;
    public static readonly roleID: string | undefined = process.env.VAULT_ROLE_ID;

    // 👇 Combine init logic in one static method
    public static async init() {
        try {
            this.client = vault({ endpoint: this.address });

            const loginResponse = await this.client.approleLogin({
                role_id: this.roleID!,
                secret_id: this.secretID!,
            });

            this.client.token = loginResponse.auth.client_token;
            console.log('[Vault] AppRole login successful');
        } catch (error) {
            console.error('[Vault] Failed to create client:', error);
            throw error;
        }
    }

    public static async getAllSecrets(path: string = this.path) {
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
}
