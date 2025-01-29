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
import { authMiddleware } from '../middleware/auth'

const tagRouter: Router = express.Router()

tagRouter.get('/', getTags)
tagRouter.get(
    '/:id',
    TagDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getTag
)
tagRouter.post(
    '/',
    authMiddleware,
    CreateTagDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createTag
)
tagRouter.delete(
    '/:id',
    authMiddleware,
    TagDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deleteTag
)

export default tagRouter