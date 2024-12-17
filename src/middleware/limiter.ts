import rateLimiter from 'express-rate-limit' // Rate limiter
import speedLimiter from 'express-slow-down' // Speed limiter

export const rateLimitMiddleware = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100
})

export const speedLimitMiddleware = speedLimiter({
    windowMs: 60 * 1000, // 1 minute
    delayAfter: 1, // After each 1 request
    delayMs: () => 500 // Delay 500ms
})