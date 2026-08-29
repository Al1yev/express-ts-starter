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

    // `HttpException` — ataylab tashlangan operatsion xato; uning xabari client uchun
    // yozilgan, shuning uchun status'idan qat'i nazar (4xx ham, 5xx ham) o'zgarmasdan
    // uzatiladi. Aks holda `HttpException(503, 'To'lov provayderi javob bermadi')` kabi
    // foydali xabarlar prod'da yo'qolardi.
    //
    // Kutilmagan xatolar esa prod'da maskalanadi — ular ichki tafsilot (DB ulanish
    // satri, fayl yo'llari, uchinchi tomon kutubxonasining ichki matni) sizdirishi
    // mumkin. Dev/test'da haqiqiy xabar qoladi, aks holda debug qilib bo'lmaydi.
    const clientMessage =
        !isHttpException && env.NODE_ENV === 'prod' ? 'Internal server error' : message;

    res.status(status).json({ success: false, message: clientMessage, data: null });
};
