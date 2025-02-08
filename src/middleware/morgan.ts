/**
 * @module
 * For logging requests with morgan and winston
 */

import morgan from 'morgan'
import logger from '../utils/logger'

const stream = {
    // Use the http severity
    write: (message: unknown) => logger.http(message)
}

const skip = () => {
    const env = process.env.NODE_ENV || 'development'

    return env !== 'development'
}

const morganMiddleware = morgan(
    ":remote-addr :method :url :status :res[content-length] - :response-time ms",
    { stream, skip }
)

export default morganMiddleware