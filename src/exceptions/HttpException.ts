export class HttpException extends Error {
    public success: boolean;
    public status: number;
    public message: string;

    constructor(status: number, message: string) {
        super(message);
        this.success = false;
        this.status = status;
        this.message = message;
    }
}
