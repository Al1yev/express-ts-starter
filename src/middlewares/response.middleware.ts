import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Response {
            success: (data: unknown, statusCode?: number, message?: string) => void;
        }
    }
}

export const ResponseMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.success = (data: unknown, statusCode = 200, message = 'OK') => {
        res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    };

    next();
};
