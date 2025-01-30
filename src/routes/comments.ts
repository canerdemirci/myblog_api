/**
 * @module
 ** ROUTES OF COMMENTS
 ** Authentication and validation middlewares are used in the following routes
 *----------------------------------------------------------------------------------------------
 * * GET:        /comments/bypostid/:postId          - Get comments by postId
 * * GET:        /comments/all                       - Get all comments
 * * GET:        /comments/:id                       - Get a comment by id
 * * POST:       /comments                           - Creates a comment
 * * PUT:        /comments                           - Updates a comment
 * * DELETE:     /comments/:id                       - Deletes a comment by id
 */

import express, { Router } from 'express'

import { validationErrorMiddleware } from '../middleware/error'
import { authMiddleware } from '../middleware/auth'

import {
    getAllComments,
    getComments,
    getComment,
    createComment,
    updateComment,
    deleteComment
} from '../controllers/comment_controller'

import CommentDTO from '../dtos/comment/CommentDTO'
import CreateCommentDTO from '../dtos/comment/CreateCommentDTO'
import UpdateCommentDTO from '../dtos/comment/UpdateCommentDTO'

const commentRouter: Router = express.Router()

// GET /comments/bypostid/:postId - Get comments by postId
commentRouter.get(
    '/bypostid/:postId',
    CommentDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getComments
)
// GET  /comments/all  - Get all comments
commentRouter.get(
    '/all',
    getAllComments
)
// GET    /comments/:id   - Get a comment by id
commentRouter.get(
    '/:id',
    CommentDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getComment
)
// POST   /comments   - Creates a comment
commentRouter.post(
    '/',
    authMiddleware,
    CreateCommentDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createComment
)
// PUT    /comments   - Updates a comment
commentRouter.put(
    '/',
    authMiddleware,
    UpdateCommentDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    updateComment
)
// DELETE    /comments/:id   - Deletes a comment by id
commentRouter.delete(
    '/:id',
    authMiddleware,
    CommentDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deleteComment
)

export default commentRouter