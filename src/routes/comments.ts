/**
 * @module commentRouter
 * Comment routes
 */

import express, { Router } from 'express'
import { validationErrorMiddleware } from '../middleware/error'
import { createComment, deleteComment, getAllComments, getComment, getComments, updateComment }
    from '../controllers/comment_controller'
import CommentDTO from '../dtos/comment/CommentDTO'
import CreateCommentDTO from '../dtos/comment/CreateCommentDTO'
import UpdateCommentDTO from '../dtos/comment/UpdateCommentDTO'

const commentRouter: Router = express.Router()

commentRouter.get(
    '/bypostid/:postId',
    CommentDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getComments
)
commentRouter.get(
    '/all',
    getAllComments
)
commentRouter.get(
    '/:id',
    CommentDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getComment
)
commentRouter.post(
    '/',
    CreateCommentDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createComment
)
commentRouter.delete(
    '/:id',
    CommentDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deleteComment
)
commentRouter.put(
    '/',
    UpdateCommentDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    updateComment
)

export default commentRouter