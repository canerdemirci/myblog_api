/**
 * My personal blog api main file.
 */
import dotenv from 'dotenv' // For loading .env file constants
import express, { Request, Response, NextFunction } from 'express'
import { param } from 'express-validator'
import { apiKeyAuth } from './auth' // Only I can use this api with an api key
import cors from 'cors'
import compression from 'compression' // For compressing response bodies
import { rateLimitMiddleware, speedLimitMiddleware } from './middleware/limiter'
import errorHandler, { ApiError, validationErrorMiddleware }
    from './middleware/error' // error handler middleware function
import morganMiddleware from './middleware/morgan' // middleware for logging requests
import logger from './utils/logger' // winston logger
import { chacher } from './utils/cacher'
import swaggerUi, { JsonObject } from 'swagger-ui-express' // API documentation package
import YAML from 'yaml' // For creating swagger documentation (swagger content)
import fs from 'fs' // For reading swagger yaml file
import path from 'path'
import multer from 'multer' // For file uploads
import postRouter from './routes/posts'
import { apiUrls } from './constants'
import { status200Ok, status204NoContent } from './controllers/responses'
import tagRouter from './routes/tags'
import basicUid from './utils/basicuid'

// Load .env file constants and create express app
dotenv.config()
const PORT = process.env.PORT || 5000
const app = express()

// Create the swagger document from a .yaml file
const yamlFile = fs.readFileSync('./swagger/swagger.yaml', 'utf-8')
const swaggerDocument = YAML.parse(yamlFile)

// Configure storage engine and filename
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + basicUid() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        try {
            if (!file) {
                cb(new ApiError(400, 'File is empty'))
            }
            // It can't be more than 5 mb
            else if (file.size > 5000000) {
                cb(new ApiError(400, 'File size can\'t be more than 5 MB'))
            }
            // Allowed file extensions jpg, jpeg, png, gif
            else if (!['.jpeg', '.jpg', '.png', '.gif'].includes(path.extname(file.originalname))) {
                cb(new ApiError(400, 'Allowed file formats are jpeg, png, gif'))
            } else {
                cb(null, true)
            }
        } catch (err) {
            cb(new ApiError(500, 'Internal server error'))
        }
    }
})

app.use(cors({
    origin: ['http://localhost:3000'],
}))
// Only I can use this api with an api key
app.use(apiKeyAuth)
// Response body compression middleware
app.use(compression())
app.use(speedLimitMiddleware)
app.use(rateLimitMiddleware)
// Use json middleware: Automatically parses JSON-encoded request bodies and assigns
// the parsed data to the req.body property of the request object.
app.use(express.json())
// Use urlencoded middleware: Automatically parses URL-encoded request bodies and assigns the
// parsed data to the req.body property of the request object. (Form data)
app.use(express.urlencoded({ extended: false }))
// If the request isn't a GET flush all chached data
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
        chacher.flushAll()
    }

    next()
})
// Static serve /uploads for blog's images, files.
app.use(apiUrls.static, express.static(path.join(__dirname, '../uploads')))
// File uploads
app.post(apiUrls.upload, upload.single('coverImage'),
    (req: Request, res: Response, next: NextFunction) => {
        status200Ok(res).json({ fileName: req.file!.path.split('/')[1] })
    })
// Delete cover image
app.delete(
    apiUrls.deleteCover,
    param('fileName').trim().escape(),
    validationErrorMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
        const { fileName } = req.params
        const filePath = path.join(__dirname, '../uploads', fileName);

        try {
            fs.unlinkSync(filePath)
            status204NoContent(res)
        } catch (err) {
            next(err)
        }
    }
)
// post router
app.use(apiUrls.posts, postRouter)
// tag router
app.use(apiUrls.tags, tagRouter)
// API documentation route
app.use(apiUrls.docs, swaggerUi.serve, swaggerUi.setup(swaggerDocument as JsonObject))
// Logging middleware with morgan
app.use(morganMiddleware)
// Error handling middleware
app.use(errorHandler)
// Starting the server
app.listen(PORT, () => logger.info(`Server started on port ${PORT}`))