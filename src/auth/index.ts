/**
 * @module apiKeyAuth
 * This middleware secures the api with a key
 * It compares the hashed api key which comes from .env file to hashed key which
 * comes from client side (request header) that hashed same method
 * If they are not same it sends 401 Unauthorized response
 */

import { NextFunction, Request, Response } from 'express'
import { status401Unauthorized } from '../controllers/responses'
import crypto from 'crypto'

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
    // Give permission to swagger ui
    if (req.path.includes('/api-docs/') || req.path.includes('/api/static/')) {
        return next()
    }

    const apiKey = process.env.API_KEY
    const clientApiKey = req.header('x-api-key')
    const hashedApiKey = crypto.createHash('sha256').update(clientApiKey!).digest('hex')

    if (!apiKey || !clientApiKey || hashedApiKey !== apiKey) {
        return status401Unauthorized(res).json({ message: 'Unauthorized'})
    }

    next()
}