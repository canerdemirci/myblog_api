/**
 * @module errorMiddleware
 * Error handling middleware module.
 */

import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import logger from '../utils/logger'
import { status400BadRequest } from '../controllers/responses'

/**
 * Custom Error for the Api
 * @class ApiError
 * @property statusCode
 */
export class ApiError extends Error {
    statusCode: number
    
    constructor(statusCode: number, message: string) {
        super(message)

        this.statusCode = statusCode
    }
}

/**
 * Error handling middleware. This function send response
 * with error info (\{ success: boolean, message: string, stack: string \}) and
 * log error info same way.
 * If error is
 * - ApiError: statusCode = Error's status code
 * - ValidationError: statusCode = 400 Bad Request
 * - Else: statusCode = 500 Internal Server Error
 * @param err - Error
 * @param req - Request
 * @param res - Response
 * @param next - NextFunction
 * @returns void
 */
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // if the response has already been sent. it passes the error to the next middleware to handle.
    if (res.headersSent) {
        return next(err)
    }
    
    const statusCode = () : number => {
        if (err instanceof ApiError)
            return err.statusCode
        
        return 500
    }

    const message = err.message || 'Something went wrong!'
    const stack: string | null | undefined = process.env.NODE_ENV === 'production'
        ? undefined : err.stack

    const errorObject = { success: false, message, stack }

    logger.error(errorObject)
    
    res.status(statusCode()).json(errorObject)
}

const validationErrorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const valResult = validationResult(req).formatWith(error => error.msg as string)
    const validationErrors = valResult.array({ onlyFirstError: true })

    if (validationErrors.length > 0) {
        const errorObject = { success: false, message: validationErrors[0], stack: undefined }

        logger.error(errorObject)

        return status400BadRequest(res).json(errorObject)
    }

    next()
}

export default errorHandler
export { validationErrorMiddleware }