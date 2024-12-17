/**
 * @module postController
 * Get posts, get a post, create a post, update a post, delete a post.
 * Sanitizing, Validation and Error handling happens in middlewares and routers.
 */

import type { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { chacher } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'

import CreatePostDTO from '../dtos/post/CreatePostDTO'
import CreateTagDTO from '../dtos/tag/CreateTagDTO'
import UpdatePostDTO from '../dtos/post/UpdatePostDTO'
import PostDTO from '../dtos/post/PostDTO'

import PostRepository from '../repositories/post_repository'
import { InteractionType } from '@prisma/client'
import PostInteractionRepository from '../repositories/postInteraction_repository'
import CreateGuestPostInteractionDTO from '../dtos/postInteraction/CreateGuestPostInteractionDTO'
import CreateUserPostInteractionDTO from '../dtos/postInteraction/CreateUserPostInteractionDTO'

const postRepo = new PostRepository()
const postInteractionRepo = new PostInteractionRepository()

/**
 * * Acquires From REQUEST BODY: title, content, cover, tags.
 * * Creates a Post with CreatePostDTO and CreateTagDTO s.
 * * Converts the Post to Object
 * * SENDS: Post json - 201 Created - With location
 * 
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const createPost = asyncHandler(async (req: Request, res: Response) => {
    const { title, content, cover, tags } : 
        { title: string, content?: string, cover?: string, tags: string[] } = req.body
    const createPostDTO = 
        new CreatePostDTO(title, content, cover)
    const createTagDTOS = tags.map(t => new CreateTagDTO(t))
    const post = await postRepo.createPost(createPostDTO, createTagDTOS)
    const postJson = post.toObject()
    status201CreatedWithLocation(res, `${apiUrls.posts}/${postJson.id}`).json(postJson)
})

/**
 * * Fetches all posts from database or chache
 * * SENDS: Post[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getPosts = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'posts'
    const chacedData = chacher.get(chacheKey)

    if (!chacedData) {
        const postsData = await postRepo.getPosts()
        const posts = postsData.map((p: PostDTO) => p.toObject())
        status200Ok(res).json(posts)
        chacher.set(chacheKey, posts, 300)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Acquires from REQUEST PARAMS: id
 * * Fetches a post by id from database or chache
 * * SENDS: Post json - 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getPost = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'post-' + req.params.id
    const chacedData = chacher.get(chacheKey)

    if (!chacedData) {
        const id: string = req.params.id

        if (!id) throw new ApiError(400, 'Bad Request: Post id required.')

        try {
            const postData = await postRepo.getPost(id)
            const post = postData.toObject()
            status200Ok(res).json(post)
            chacher.set(chacheKey, post, 300)
        } catch (err) {
            throw new ApiError(404, 'Post not found with given id')
        }
    } else {
        status200Ok(res).json(chacedData)
    }
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
const deletePost = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    if (!id) throw new ApiError(400, 'Bad Request: Post id required.')

    try {
        await postRepo.deletePost(id)
        status204NoContent(res)
    } catch (err) {
        throw new ApiError(404, 'Post not found with given id')
    }
})

/**
 * * Acquires from REQUEST BODY: id, title, content, cover, tags
 * * Updates a Post with UpdatePostDTO
 * * SENDS: 204 No Content
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const updatePost = asyncHandler(async (req: Request, res: Response) => {
    const { id, title, content, cover, tags } : 
        { id: string, title: string, content?: string, cover?: string, tags: string[] } = req.body
    const updatePostDTO = new UpdatePostDTO(id, title, content, cover)
    const createTagDTOS = tags.map(t => new CreateTagDTO(t))
    await postRepo.updatePost(updatePostDTO, createTagDTOS)
    status204NoContent(res)
})

/**
 * * Acquires from REQUEST BODY: type, postId, questId
 * * Adds u guest interaction to PostInteraction table
 * * The guest can't like, unlike or view a post more than one and can share a post
 * more than one time.
 * * Changes view, share or like count of a post then add record to post interactions table
 * to keep track interactions of a quest or an user.
 * * SENDS: 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const addGuestInteraction = asyncHandler(async (req: Request, res: Response) => {
    const { type, postId, guestId }
        : { type: InteractionType, postId: string, guestId: string } = req.body
    
    const createGuestPostInteractionDTO =
        new CreateGuestPostInteractionDTO(type, postId, guestId, req.ip)
    await postInteractionRepo.createGuestInteraction(createGuestPostInteractionDTO)

    status200Ok(res).send()
})

/**
 * * Acquires from REQUEST BODY: type, postId, userId
 * * Adds u user interaction to PostInteraction table
 * * The user can't like, unlike or view a post more than one and can share a post
 * more than one time.
 * * Changes view, share or like count of a post then add record to post interactions table
 * to keep track interactions of a quest or an user.
 * * SENDS: 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const addUserInteraction = asyncHandler(async (req: Request, res: Response) => {
    const { type, postId, userId }
        : { type: InteractionType, postId: string, userId: string } = req.body
    
    const createUserPostInteractionDTO =
        new CreateUserPostInteractionDTO(type, postId, userId)
    await postInteractionRepo.createUserInteraction(createUserPostInteractionDTO)

    status200Ok(res).send()
})

/**
 * * Fetches the guest post interactions.
 * * Acquires from REQUEST QUERY - type, guestId, postId
 * * SENDS: 200 OK - GuestPostInteractionDTO[] as json
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const getGuestInteractions = asyncHandler(async (req: Request, res: Response) => {
    const type = req.query.type as string
    const guestId = req.query.guestId as string
    const postId = req.query.postId as string

    const results = await postInteractionRepo.getGuestInteractions(
        type as InteractionType, guestId + '-' + req.ip, postId)
    
    status200Ok(res).json(results.map(r => r.toObject()))
})

/**
 * * Fetches the user post interactions.
 * * Acquires from REQUEST QUERY - type, userId, postId
 * * SENDS: 200 OK - UserPostInteractionDTO[] as json
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const getUserInteractions = asyncHandler(async (req: Request, res: Response) => {
    const type = req.query.type as string
    const userId = req.query.userId as string
    const postId = req.query.postId as string

    const results = await postInteractionRepo.getUserInteractions(
        type as InteractionType, userId, postId)
    
    status200Ok(res).json(results.map(r => r.toObject()))
})

export {
    createPost,
    getPosts,
    getPost,
    deletePost,
    updatePost,
    addGuestInteraction,
    addUserInteraction,
    getGuestInteractions,
    getUserInteractions
}