/**
 * @module postsRouter
 * Post routes
 */

import express, { Router } from 'express'
import {
    createPost, getPosts, getPost, deletePost, updatePost,
    addGuestInteraction, addUserInteraction, getGuestInteractions, getUserInteractions, getPostSearchResults, getRelatedPosts, getPostsOfTag, getUnusedCovers, getUnusedImages
}
    from '../controllers/post_controller'
import CreatePostDTO from '../dtos/post/CreatePostDTO'
import PostDTO from '../dtos/post/PostDTO'
import UpdatePostDTO from '../dtos/post/UpdatePostDTO'
import RelatedPostDTO from '../dtos/post/RelatedPostDTO'
import { validationErrorMiddleware } from '../middleware/error'
import CreateGuestPostInteractionDTO from '../dtos/postInteraction/CreateGuestPostInteractionDTO'
import CreateUserPostInteractionDTO from '../dtos/postInteraction/CreateUserPostInteractionDTO'
import GuestPostInteractionDTO from '../dtos/postInteraction/GuestPostInteractionDTO'
import UserPostInteractionDTO from '../dtos/postInteraction/UserPostInteractionDTO'
import PostSearchResultDTO from '../dtos/post/PostSearchResultDTO'
import PostOfTagDTO from '../dtos/post/PostOfTagDTO'
import { authMiddleware } from '../middleware/auth'

const postRouter: Router = express.Router()

postRouter.get(
    '/',
    PostDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getPosts
)
postRouter.get(
    '/search/:query',
    PostSearchResultDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getPostSearchResults
)
postRouter.get(
    '/tag/:tag',
    PostOfTagDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getPostsOfTag
)
postRouter.get(
    '/:id',
    PostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getPost
)
postRouter.get(
    '/maintenance/unused-covers',
    getUnusedCovers
)
postRouter.get(
    '/maintenance/unused-images',
    getUnusedImages
)
postRouter.post(
    '/',
    authMiddleware,
    CreatePostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createPost
)
postRouter.post(
    '/related',
    RelatedPostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getRelatedPosts
)
postRouter.delete(
    '/:id',
    authMiddleware,
    PostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deletePost
)
postRouter.put(
    '/',
    authMiddleware,
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
    authMiddleware,
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