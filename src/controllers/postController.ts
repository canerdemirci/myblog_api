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

const getPosts = asyncHandler(async (req: Request, res: Response) => {
    const posts = await postRepository.getPosts();
    status200Ok(res).json(posts.map(p => p.toObject()));
});

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