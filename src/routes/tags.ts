/**
 * @module tagsRouter
 * Tag routes
 */

import express, { Router } from 'express'
import { createTag, getTags, getTag, deleteTag }
    from '../controllers/tag_controller'
import TagDTO from '../dtos/tag/TagDTO'
import CreateTagDTO from '../dtos/tag/CreateTagDTO'
import { validationErrorMiddleware } from '../middleware/error'

const tagRouter: Router = express.Router()

tagRouter.use(validationErrorMiddleware)
tagRouter.get('/', getTags)
tagRouter.get(
    '/:id',
    TagDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getTag
)
tagRouter.post(
    '/',
    CreateTagDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createTag
)
tagRouter.delete(
    '/:id',
    TagDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deleteTag
)

export default tagRouter