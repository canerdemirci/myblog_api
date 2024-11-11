/**
 * @module postsRouter
 * Post routes
 */

import express, { Router } from 'express'
import { createPost, getPosts, getPost, deletePost, updatePost }
    from '../controllers/post_controller'
import CreatePostDTO from '../dtos/post/CreatePostDTO'
import PostDTO from '../dtos/post/PostDTO'
import UpdatePostDTO from '../dtos/post/UpdatePostDTO'
import { validationErrorMiddleware } from '../middleware/error'

const postRouter: Router = express.Router()

postRouter.get('/', getPosts)
postRouter.get(
    '/:id',
    PostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getPost
)
postRouter.post(
    '/',
    CreatePostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createPost
)
postRouter.delete(
    '/:id',
    PostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deletePost
)
postRouter.put(
    '/',
    UpdatePostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    updatePost
)

export default postRouter