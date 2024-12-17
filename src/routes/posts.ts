/**
 * @module postsRouter
 * Post routes
 */

import express, { Router } from 'express'
import { createPost, getPosts, getPost, deletePost, updatePost, addGuestInteraction, addUserInteraction, getGuestInteractions, getUserInteractions }
    from '../controllers/post_controller'
import CreatePostDTO from '../dtos/post/CreatePostDTO'
import PostDTO from '../dtos/post/PostDTO'
import UpdatePostDTO from '../dtos/post/UpdatePostDTO'
import { validationErrorMiddleware } from '../middleware/error'
import CreateGuestPostInteractionDTO from '../dtos/postInteraction/CreateGuestPostInteractionDTO'
import CreateUserPostInteractionDTO from '../dtos/postInteraction/CreateUserPostInteractionDTO'
import GuestPostInteractionDTO from '../dtos/postInteraction/GuestPostInteractionDTO'
import UserPostInteractionDTO from '../dtos/postInteraction/UserPostInteractionDTO'

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
postRouter.post(
    '/interactions/guest',
    CreateGuestPostInteractionDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    addGuestInteraction
)
postRouter.post(
    '/interactions/user',
    CreateUserPostInteractionDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    addUserInteraction
)
postRouter.get(
    '/interactions/guest',
    GuestPostInteractionDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getGuestInteractions
)
postRouter.get(
    '/interactions/user',
    UserPostInteractionDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getUserInteractions
)

export default postRouter