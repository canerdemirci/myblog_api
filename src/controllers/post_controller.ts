/**
 * @module postController
 * Get posts, get a post, create a post, update a post, delete a post
 */

import { apiUrls } from '../constants'
import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'
import { chacher } from '../utils/cacher'
import CreatePostDTO from '../dtos/post/CreatePostDTO'
import CreateTagDTO from '../dtos/tag/CreateTagDTO'
import UpdatePostDTO from '../dtos/post/UpdatePostDTO'
import PostDTO from '../dtos/post/PostDTO'
import PostRepository from '../repositories/post_repository'

const postRepo = new PostRepository()

/**
 * This handler takes title, content, cover strings and tags from request.
 * Creates a DTO
 * Apply filter it
 * Validate it
 * Creates a post in the database
 * Converts it to js object and sends it as a response with 201 status code
 * with created post location.
 * Errors that may occur:
 *  - 500 Internal server error
 *  - 400 Bad request - Validation error
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
 * This handler fetchs all posts in the database and
 * sends them as a response with 200 status code with array of post objects
 * Errors that may occur:
 *  - 500 Internal server error
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
 * This handler fetchs a post by id then sends it as a response
 * with status code 200 with post object.
 * Errors that may occur:
 *  - 500 Internal server error
 *  - 400 Bad request
 *  - 404 Not found
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
 * This handler deletes a post by id from database then response
 * 204 No Content.
 * Errors that may occur:
 *  - 500 Internal server error
 *  - 400 Bad Request
 *  - 404 Not Found
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
 * This handler updates a post.
 * Takes id, title and content strings
 * then creates DTO,
 * apply filter,
 * validate then
 * updates from database.
 * Send response 204 No Content.
 * Errors that may occur:
 *  - 500 Internal server error
 *  - 400 Bad Request
 */
const updatePost = asyncHandler(async (req: Request, res: Response) => {
    const { id, title, content, cover, tags } : 
        { id: string, title: string, content?: string, cover?: string, tags: string[] } = req.body
    const updatePostDTO = new UpdatePostDTO(id, title, content, cover)
    const createTagDTOS = tags.map(t => new CreateTagDTO(t))
    await postRepo.updatePost(updatePostDTO, createTagDTOS)
    status204NoContent(res)
})

export {
    createPost,
    getPosts,
    getPost,
    deletePost,
    updatePost
}