/**
 * @module
 ** ROUTES OF POSTS
 ** Authentication and validation middlewares are used in the following routes
 *----------------------------------------------------------------------------------------------
 * * GET:       /posts                              - Get posts by optional pagination and tag
 * * GET:       /posts/:id                          - Get a post by id
 * * GET:       /posts/search/:query                - Get posts by search query
 * * GET:       /posts/tag/:tag                     - Get posts of a tag
 * * GET:       /posts/interactions/guest?type&guestId&postId       - Get guest interactions
 * * GET:       /posts/interactions/user?type&userId&postId         - Get user interactions
 * * GET:       /posts/maintenance/unused-covers    - Get unused post covers
 * * GET:       /posts/maintenance/unused-images    - Get unused post images
 * * POST:      /posts                              - Creates a post
 * * POST:      /posts/related                      - Get related posts by tags
 * * POST:      /posts/interaction/guest            - Add a guest interaction to a post
 * * POST:      /posts/interaction/user             - Add a user interaction to a post
 * * PUT:       /posts                              - Update a post
 * * DELETE:    /posts/:id                          - Delete a post by id
 */

import express, { Router } from 'express'
import {
    getPosts,
    getPost,
    getPostSearchResults,
    getPostsOfTag,
    getGuestInteractions,
    getUserInteractions,
    getUnusedCovers,
    getUnusedImages,
    createPost,
    getRelatedPosts,
    addGuestInteraction,
    addUserInteraction,
    updatePost,
    deletePost
} from '../controllers/post_controller'

import CreatePostDTO from '../dtos/post/CreatePostDTO'
import PostDTO from '../dtos/post/PostDTO'
import UpdatePostDTO from '../dtos/post/UpdatePostDTO'
import RelatedPostDTO from '../dtos/post/RelatedPostDTO'
import CreateGuestPostInteractionDTO from '../dtos/postInteraction/CreateGuestPostInteractionDTO'
import CreateUserPostInteractionDTO from '../dtos/postInteraction/CreateUserPostInteractionDTO'
import GuestPostInteractionDTO from '../dtos/postInteraction/GuestPostInteractionDTO'
import UserPostInteractionDTO from '../dtos/postInteraction/UserPostInteractionDTO'
import PostSearchResultDTO from '../dtos/post/PostSearchResultDTO'
import PostOfTagDTO from '../dtos/post/PostOfTagDTO'

import { validationErrorMiddleware } from '../middleware/error'
import { authMiddleware } from '../middleware/auth'

const postRouter: Router = express.Router()

// GET: /posts - Get posts by optional pagination and tag
postRouter.get(
    '/',
    PostDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getPosts
)
// GET: /posts/:id - Get a post by id
postRouter.get(
    '/:id',
    PostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getPost
)
// GET: /posts/search/:query - Get posts by search query
postRouter.get(
    '/search/:query',
    PostSearchResultDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getPostSearchResults
)
// GET: /posts/tag/:tag - Get posts of a tag
postRouter.get(
    '/tag/:tag',
    PostOfTagDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getPostsOfTag
)
// GET: /posts/interactions/guest - Get guest interactions
postRouter.get(
    '/interactions/guest',
    GuestPostInteractionDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getGuestInteractions
)
// GET: /posts/interactions/user - Get user interactions
postRouter.get(
    '/interactions/user',
    UserPostInteractionDTO.validationAndSanitizationSchema2(),
    validationErrorMiddleware,
    getUserInteractions
)
// GET: /posts/maintenance/unused-covers - Get unused post covers
postRouter.get(
    '/maintenance/unused-covers',
    getUnusedCovers
)
// GET: /posts/maintenance/unused-images - Get unused post images
postRouter.get(
    '/maintenance/unused-images',
    getUnusedImages
)
// POST: /posts - Creates a post
postRouter.post(
    '/',
    authMiddleware,
    CreatePostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    createPost
)
// POST: /posts/related - Get related posts by tags
postRouter.post(
    '/related',
    RelatedPostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    getRelatedPosts
)
// POST: /posts/interaction/guest - Add a guest interaction to a post
postRouter.post(
    '/interactions/guest',
    CreateGuestPostInteractionDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    addGuestInteraction
)
// POST: /posts/interaction/user - Add a user interaction to a post
postRouter.post(
    '/interactions/user',
    authMiddleware,
    CreateUserPostInteractionDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    addUserInteraction
)
// PUT: /posts - Update a post
postRouter.put(
    '/',
    authMiddleware,
    UpdatePostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    updatePost
)
// DELETE: /posts/:id - Delete a post by id
postRouter.delete(
    '/:id',
    authMiddleware,
    PostDTO.validationAndSanitizationSchema(),
    validationErrorMiddleware,
    deletePost
)

export default postRouter