import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions';

/**
 * @name ValidationMiddleware
 * @description Allows use of decorator and non-decorator based validation
 * @param type dto
 * @param skipMissingProperties When skipping missing properties
 * @param whitelist Even if your object is an instance of a validation class it can contain additional properties that are not defined
 * @param forbidNonWhitelisted If you would rather to have an error thrown when any non-whitelisted properties are present
 */
export const ValidationMiddleware = (
    type: any,
    skipMissingProperties = false,
    whitelist = false,
    forbidNonWhitelisted = false,
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
