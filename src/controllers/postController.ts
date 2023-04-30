/**
 * @module postController
 * Get posts, get a post, create a post, update a post, delete a post
 */

import CreatePostDTO from '../dtos/post/CreatePostDTO';
import * as postRepository from '../repositories/postRepository';
import { Request, Response } from 'express';
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../middleware/error.middleware';
import UpdatePostDTO from '../dtos/post/UpdatePostDTO';

/**
 * This controller takes title and content strings from request.
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
    const { title, content } : { title: string, content?: string } = req.body;
    const createPostDTO = new CreatePostDTO(title, content);
    createPostDTO.applyFilter();    
    await createPostDTO.validate();
    const post = await postRepository.createPost(createPostDTO);
    const postJson = post.toObject();
    status201CreatedWithLocation(res, `/api/posts/${postJson.id}`).json(postJson);
});

/**
 * This controller fetchs all posts in the database and
 * sends them as a response with 200 status code with array of post objects
 * Errors that may occur:
 *  - 500 Internal server error
 */
const getPosts = asyncHandler(async (req: Request, res: Response) => {
    const posts = await postRepository.getPosts();
    status200Ok(res).json(posts.map(p => p.toObject()));
});

/**
 * This controller fetchs a post by id then sends it as a response
 * with status code 200 with post object.
 * Errors that may occur:
 *  - 500 Internal server error
 *  - 400 Bad request
 *  - 404 Not found
 */
const getPost = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id;

    if (!id) throw new ApiError(400, 'Bad Request: Post id required.');

    try {
        const post = await postRepository.getPost(id);
        status200Ok(res).json(post.toObject());
    } catch (err) {
        throw new ApiError(404, 'Post not found with given id');
    }
});

/**
 * This controller deletes a post by id from database then response
 * 204 No Content.
 * Errors that may occur:
 *  - 500 Internal server error
 *  - 400 Bad Request
 *  - 404 Not Found
 */
const deletePost = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id;

    if (!id) throw new ApiError(400, 'Bad Request: Post id required.');

    try {
        await postRepository.deletePost(id);
        status204NoContent(res);
    } catch (err) {
        throw new ApiError(404, 'Post not found with given id');
    }
});

/**
 * This controller updates a post.
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
    const { id, title, content } : { id: string, title: string, content?: string } = req.body;
    const updatePostDTO = new UpdatePostDTO(id, title, content);
    updatePostDTO.applyFilter();
    await updatePostDTO.validate();
    await postRepository.updatePost(updatePostDTO);
    status204NoContent(res);
});

export {
    createPost,
    getPosts,
    getPost,
    deletePost,
    updatePost
}