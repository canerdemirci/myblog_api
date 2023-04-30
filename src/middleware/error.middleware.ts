/**
 * @module errorMiddleware
 * Error handling module.
 */

import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'joi';
import logger from '../utils/logger';

/**
 * Custom Error for this Api
 * @property statusCode
 */
export class ApiError extends Error {
    statusCode: number;
    
    constructor(statusCode: number, message: string) {
        super(message);

        this.statusCode = statusCode;
    }
}

/**
 * Error handling function. This function send response
 * with error info ({ success: boolean, message: string, stack: string}) and
 * log error info same way.
 * If error is
 * - ApiError: statusCode = Error's status code
 * - ValidationError: statusCode = 400 Bad Request
 * - Else: statusCode = 500 Internal Server Error
 * @param err 
 * @param req 
 * @param res 
 * @param next 
 * @returns void
 */
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err)
    }

    const success = false;

    const statusCode = () : number => {
        if (err instanceof ApiError)
            return err.statusCode;
        if (err instanceof ValidationError)
            return 400;
        
        return 500;
    }

    const message: string = err.message || 'Something went wrong!';
    const stack: string | null | undefined = process.env.NODE_ENV === 'production' ? undefined : err.stack;

    const errorJson = { success, message, stack };

    logger.error(errorJson);
    
    res.status(statusCode())
        .json(errorJson);
}

export default errorHandler;