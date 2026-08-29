import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions';

/**
 * @name ValidationMiddleware
 * @description Allows use of decorator and non-decorator based validation
 * @param type dto
 * @param skipMissingProperties When skipping missing properties
 * @param whitelist Strips properties that are not defined on the validation class (defaults to true)
 * @param forbidNonWhitelisted Throws an error when any non-whitelisted properties are present (defaults to true)
 */
export const ValidationMiddleware = (
    type: any,
    skipMissingProperties = false,
    whitelist = true,
    forbidNonWhitelisted = true,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dto = plainToInstance(type, req.body);
        try {
            await validateOrReject(dto, {
                skipMissingProperties,
                whitelist,
                forbidNonWhitelisted,
            });
        } catch (errors) {
            if (Array.isArray(errors)) {
                const message = errors
                    .flatMap((error: any) =>
                        error.constraints ? Object.values(error.constraints) : [],
                    )
                    .join(', ');
                return next(new HttpException(400, message));
            } else {
                return next(errors);
            }
        }
        req.body = dto;
        next();
    };
};
