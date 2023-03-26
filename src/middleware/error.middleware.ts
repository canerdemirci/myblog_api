import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'joi';
import logger from '../utils/logger';

export class ApiError extends Error {
    statusCode: number;
    
    constructor(statusCode: number, message: string) {
        super(message);

        this.statusCode = statusCode;
    }
}

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