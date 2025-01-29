import { NextFunction, Request, Response } from 'express'
import { status401Unauthorized } from '../controllers/responses'
import { verifyJWT } from '../utils/jwt'
import asyncHandler from 'express-async-handler'
import UserRepository from '../repositories/user_repository'

const userRepo = new UserRepository()

/**
 * This middleware secures the api with a key
 * It compares the hashed api key which comes from .env file to hashed key which
 * comes from client side (request header) that hashed same method
 * If they are not same it sends 401 Unauthorized response.
 * It doesn't apply authentication for the route /api-docs/ because swagger handle this.
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
    // Give permission to swagger ui
    if (req.path.includes('api-docs') || req.path.includes('/api/static/')) {
        return next()
    }

    const apiKey = process.env.API_KEY
    const clientApiKey = req.header('x-api-key')

    if (clientApiKey !== apiKey) {
        return status401Unauthorized(res).json({
            success: false,
            message: 'Unauthorized',
            stack: undefined,
        })
    }
    
    next()
}

/**
 * This middleware give permissions to some actions by looking a jwt token
 * to understand action owner is admin or a valid user.  
 */
export const authMiddleware = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers['authorization']?.split(' ')[1]
        const adminToken = req.headers['x-admin'] as string

        if (adminToken) {
            const decoded = await verifyJWT(adminToken, process.env.USER_AUTH_SECRET!) as {
                role: string
            }

            if (decoded.role === 'admin') {
                return next()
            }
        }
        
        if (!token) {
            status401Unauthorized(res).json({
                success: false,
                message: 'Unauthorized',
                stack: undefined,
            })
            return
        } else {
            const payloadData = await verifyJWT(token, process.env.USER_AUTH_SECRET!) as {
                userId: string, email: string
            }

            if (!payloadData) {
                status401Unauthorized(res).json({
                    success: false,
                    message: 'Unauthorized',
                    stack: undefined,
                })
                return
            } else {
                try {
                    const user = await userRepo.getUser(payloadData.userId)

                    if (user.id !== payloadData.userId || user.email !== payloadData.email) {
                        status401Unauthorized(res).json({
                            success: false,
                            message: 'Unauthorized',
                            stack: undefined,
                        })
                        return
                    }
                } catch (_) {
                    status401Unauthorized(res).json({
                        success: false,
                        message: 'Unauthorized',
                        stack: undefined,
                    })
                    return
                }
            }
        }

        next()
    }
)