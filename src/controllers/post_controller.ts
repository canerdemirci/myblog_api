/**
 * @module
 * @class PostController
 * Authorization, Sanitizing, Validation and Error handling made in routers by middlewares.
 *----------------------------------------------------------------------------------------------
 * * GET:       /posts                              - Get posts by optional pagination and tag
 * * GET:       /posts/:id                          - Get a post by id
 * * GET:       /posts/search/:query                - Get posts by search query
 * * GET:       /posts/tag/:tag                     - Get posts of a tag
 * * GET:       /posts/interactions/guest           - Get guest interactions
 * * GET:       /posts/interactions/user            - Get user interactions
 * * GET:       /posts/maintenance/unused-covers    - Get unused post covers
 * * GET:       /posts/maintenance/unused-images    - Get unused post images
 * * POST:      /posts                              - Creates a post
 * * POST:      /posts/related                      - Get related posts by tags
 * * POST:      /posts/interaction/guest            - Add a guest interaction to a post
 * * POST:      /posts/interaction/user             - Add a user interaction to a post
 * * PUT:       /posts                              - Update a post
 * * DELETE:    /posts/:id                          - Delete a post by id
 */

import asyncHandler from 'express-async-handler'
import { cacher } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'
import fs from 'fs'
import path from 'path'

import PostRepository from '../repositories/post_repository'
import PostInteractionRepository from '../repositories/postInteraction_repository'

import CreateTagDTO from '../dtos/tag/CreateTagDTO'
import CreatePostDTO from '../dtos/post/CreatePostDTO'
import UpdatePostDTO from '../dtos/post/UpdatePostDTO'
import PostDTO from '../dtos/post/PostDTO'
import CreateGuestPostInteractionDTO from '../dtos/postInteraction/CreateGuestPostInteractionDTO'
import CreateUserPostInteractionDTO from '../dtos/postInteraction/CreateUserPostInteractionDTO'
import PostSearchResultDTO from '../dtos/post/PostSearchResultDTO'
import RelatedPostDTO from '../dtos/post/RelatedPostDTO'
import PostOfTagDTO from '../dtos/post/PostOfTagDTO'

import type { Request, Response } from 'express'
import type { InteractionType } from '@prisma/client'
import type {
    AddGuestInteractionReqBody,
    AddUserInteractionReqBody,
    CreatePostReqBody,
    GetGuestInteractionReqQuery,
    GetPostsReqQuery,
    GetRelatedPostsReqBody,
    GetUserInteractionReqQuery,
    UpdatePostReqBody
} from '../types/post'

const postRepo = new PostRepository()
const postInteractionRepo = new PostInteractionRepository()

/**
 * * Fetches all posts with optional tag and limitation from database or chache
 * * REQUEST: GET - take, skip, tagId - Query
 * * RESPONSE: 200 OK - Json - Post[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getPosts = asyncHandler(async (req: Request, res: Response) => {
    const { take, skip, tagId } = req.query as GetPostsReqQuery

    const takeNumber = take ? (isNaN(parseInt(take)) ? undefined : parseInt(take)) : undefined
    const skipNumber = skip ? (isNaN(parseInt(skip)) ? undefined : parseInt(skip)) : undefined

    if (takeNumber && skipNumber) {
        if (takeNumber < 1 || skipNumber < 0) {
            throw new ApiError(400, 'Invalid take or skip number')
        }
    }

    const chacheKey =
        (takeNumber && skipNumber)
            ? (`posts-${takeNumber}-${skipNumber}` + (!tagId ? '' : `-${tagId}`))
            : ('posts' + (!tagId ? '' : `-${tagId}`))

    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const postsData =
            (takeNumber && skipNumber)
                ? await postRepo.getPosts({ take: takeNumber, skip: skipNumber }, tagId)
                : await postRepo.getPosts(undefined, tagId)
                
        const posts = postsData.map((p: PostDTO) => p.toObject())
        cacher.set(chacheKey, posts, 300)
        status200Ok(res).json(posts)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Fetches a post by id from database or chache
 * * REQUEST: GET - id - Path
 * * RESPONSE: 200 OK - Json - Post
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getPost = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    const chacheKey = 'post-' + id
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        try {
            const postData = await postRepo.getPost(id)
            const post = postData.toObject()
            cacher.set(chacheKey, post, 300)
            status200Ok(res).json(post)
        } catch (err) {
            throw new ApiError(404, 'Post not found with given id')
        }
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Fetches post search results from database
 * * REQUEST: GET - query - Path
 * * RESPONSE: 200 OK - Json - PostSearchResult
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getPostSearchResults = asyncHandler(async (req: Request, res: Response) => {
    const query = req.params.query as string

    const postsData = await postRepo.getPostSearchResults(query)
    const posts = postsData.map((p: PostSearchResultDTO) => p.toObject())
    status200Ok(res).json(posts)
})

/**
 * * Fetches posts that belongs to a tag from database or cache.
 * * REQUEST: GET - tag - Path
 * * RESPONSE: 200 OK - Json - PostOfTag
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getPostsOfTag = asyncHandler(async (req: Request, res: Response) => {
    const tag: string = req.params.tag

    const chacheKey = 'postsoftag-' + tag
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const postsData = await postRepo.getPostsOfTag(tag)
        const posts = postsData.map((p: PostOfTagDTO) => p.toObject())
        cacher.set(chacheKey, posts, 300)
        status200Ok(res).json(posts)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Fetches guest interactions of a post from database.
 * * REQUEST: GET - type, guestId, postId - Query
 * * RESPONSE: 200 OK - Json - GuestPostInteraction[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getGuestInteractions = asyncHandler(async (req: Request, res: Response) => {
    const { type, guestId, postId } = req.query as GetGuestInteractionReqQuery

    const results = await postInteractionRepo.getGuestInteractions(
        type as InteractionType, guestId + '-' + req.ip, postId)
    
    status200Ok(res).json(results.map(r => r.toObject()))
})

/**
 * * Fetches user interactions of a post from database.
 * * REQUEST: GET - type, userId, postId - Query
 * * RESPONSE: 200 OK - Json - UserPostInteraction[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getUserInteractions = asyncHandler(async (req: Request, res: Response) => {
    const { type, userId, postId } = req.query as GetUserInteractionReqQuery

    const results = await postInteractionRepo.getUserInteractions(
        type as InteractionType, userId, postId)
    
    status200Ok(res).json(results.map(r => r.toObject()))
})

/**
 * * Fetches unused post cover images in folder.
 * * REQUEST: GET
 * * RESPONSE: 200 OK - Json - string[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getUnusedCovers = asyncHandler(async (req: Request, res: Response) => {
    const directoryPath = path.join(__dirname, '../../uploads');

    fs.readdir(directoryPath, async function (err, files) {
        if (err) {
            throw new ApiError(500, 'Unable to scan directory: ' + err)
        }

        const coverFileList = files.filter(f => f.startsWith('coverImage-'))
        const postCoverList = await postRepo.getPostCoversList()
        const unusedCovers = coverFileList.filter(c => !postCoverList.includes(c))
        
        status200Ok(res).json(unusedCovers)
    })
})

/**
 * * Fetches unused post content images in folder.
 * * REQUEST: GET
 * * RESPONSE: 200 OK - Json - string[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getUnusedImages = asyncHandler(async (req: Request, res: Response) => {
    const directoryPath = path.join(__dirname, '../../uploads/images_of_posts');

    fs.readdir(directoryPath, async function (err, files) {
        if (err) {
            throw new ApiError(500, 'Unable to scan directory: ' + err)
        }

        const imageFileList = files.filter(f => f.startsWith('postImages-'))
        const postImageList = await postRepo.getPostImagesList()
        const unusedImages = imageFileList.filter(c => !postImageList.includes(c))
        
        status200Ok(res).json(unusedImages)
    })
})

/**
 * * Creates a post in database.
 * * REQUEST: POST - title, images, content, description, cover, tags - Body
 * * RESPONSE: 201 Created with Location - Json - Post
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const createPost = asyncHandler(async (req: Request, res: Response) => {
    const {
        title,
        images,
        content,
        description,
        cover,
        tags
    } : CreatePostReqBody = req.body

    const createPostDTO = new CreatePostDTO(title, images, content, description, cover)
    const createTagDTOS = tags.map(t => new CreateTagDTO(t))
    const post = await postRepo.createPost(createPostDTO, createTagDTOS)
    const postJson = post.toObject()
    status201CreatedWithLocation(res, `${apiUrls.posts}/${postJson.id}`).json(postJson)
})

/**
 * * Fetches related posts from database by tags.
 * * REQUEST: POST - tags - Body
 * * RESPONSE: 200 OK - Json - RelatedPost[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getRelatedPosts = asyncHandler(async (req: Request, res: Response) => {
    const { tags } : GetRelatedPostsReqBody = req.body

    const postsData = await postRepo.getRelatedPosts(tags)
    const posts = postsData.map((p: RelatedPostDTO) => p.toObject())
    status200Ok(res).json(posts)
})

/**
 * * Adds guest interaction to a post interaction table.
 * * The guest can't like, unlike or view a post more than one time but can share a post
 * * Changes view, share or like count of a post.
 * * REQUEST: POST - type, postId, guestId - Body
 * * RESPONSE: 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const addGuestInteraction = asyncHandler(async (req: Request, res: Response) => {
    const { type, postId, guestId } : AddGuestInteractionReqBody = req.body
    
    const createGuestPostInteractionDTO =
        new CreateGuestPostInteractionDTO(type, postId, guestId, req.ip)
    await postInteractionRepo.createGuestInteraction(createGuestPostInteractionDTO)

    status200Ok(res).send()
})

/**
 * * Adds user interaction to a post interaction table.
 * * The user can't like, unlike or view a post more than one time but can share a post
 * * Changes view, share or like count of a post.
 * * REQUEST: POST - type, postId, userId - Body
 * * RESPONSE: 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const addUserInteraction = asyncHandler(async (req: Request, res: Response) => {
    const { type, postId, userId } : AddUserInteractionReqBody = req.body
    
    const createUserPostInteractionDTO =
        new CreateUserPostInteractionDTO(type, postId, userId)
    await postInteractionRepo.createUserInteraction(createUserPostInteractionDTO)

    status200Ok(res).send()
})

/**
 * * Updates a post.
 * * REQUEST: PUT - id, title, images, content, description, cover, tags - Body
 * * RESPONSE: 204 No content
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const updatePost = asyncHandler(async (req: Request, res: Response) => {
    const {
        id,
        title,
        images,
        content,
        description,
        cover,
        tags
    } : UpdatePostReqBody = req.body

    const updatePostDTO = new UpdatePostDTO(id, title, images, content, description, cover)
    const createTagDTOS = tags.map(t => new CreateTagDTO(t))
    await postRepo.updatePost(updatePostDTO, createTagDTOS)
    status204NoContent(res)
})

/**
 * * Acquires from REQUEST PARAMS: id
 * * Deletes a post from database by id
 * * SENDS: 204 No Content
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
/**
 * * Deletes a post.
 * * REQUEST: DELETE - id - Path
 * * RESPONSE: 204 No content
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const deletePost = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    await postRepo.deletePost(id)
    status204NoContent(res)
})

export {
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
}