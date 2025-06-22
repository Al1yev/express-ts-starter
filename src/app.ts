import express from 'express';

export class App {
    public app: express.Application;
    public env: string;
    public port: string | number;

    constructor() {
        this.app = express();
        this.env = process.env.NODE_NEV ?? 'development';
        this.port = process.env.PORT ?? 5000;
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Server is listening on port: ${this.port}`);
        });
    }
}
