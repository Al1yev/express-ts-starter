import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions';
import { env } from '@config';

export const ErrorMiddleware = (
    error: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
) => {
    const isHttpException = error instanceof HttpException;
    const status: number = isHttpException ? error.status : 500;
    const message: string = error instanceof Error ? error.message : 'Unexpected error';

    console.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    if (!isHttpException && error instanceof Error) {
        console.error(error.stack);
    }

    // Kutilmagan xatolar prod'da ichki tafsilotlarni oshkor qilmasligi kerak.
    // Dev/test'da haqiqiy xabar qoladi, aks holda debug qilib bo'lmaydi.
    const clientMessage =
        status >= 500 && env.NODE_ENV === 'prod' ? 'Internal server error' : message;

    res.status(status).json({ success: false, message: clientMessage, data: null });
};
