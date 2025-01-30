/**
 * @module
 ** ROUTES OF TAGS
 ** Authentication and validation middlewares are used in the following routes
 *----------------------------------------------------------------------------------------------
 * * GET:       /tags                              - Get all tags
 * * GET:       /tags/:id                          - Get a tag by id
 * * POST:      /tags                              - Create a tag
 * * DELETE:    /tags/:id                          - Deletes a tag by id
 */

import express, { Router } from 'express'
import { validationErrorMiddleware } from '../middleware/error'
import { authMiddleware } from '../middleware/auth'

import { getTags, getTag, createTag, deleteTag } from '../controllers/tag_controller'

import TagDTO from '../dtos/tag/TagDTO'
import CreateTagDTO from '../dtos/tag/CreateTagDTO'

const tagRouter: Router = express.Router()

// GET: /tags - Get all tags
tagRouter.get('/', getTags)
// GET: /tags/:id - Get a tag by id
tagRouter.get(
    '/:id',
    TagDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getTag
)
// POST: /tags - Create a tag
tagRouter.post(
    '/',
    authMiddleware,
    CreateTagDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createTag
)
// DELETE: /tags/:id - Deletes a tag by id
tagRouter.delete(
    '/:id',
    authMiddleware,
    TagDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deleteTag
)

export default tagRouter