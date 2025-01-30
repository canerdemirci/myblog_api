/**
 * @module
 * Authorization, Sanitizing, Validation and Error handling made in routers by middlewares.
 *----------------------------------------------------------------------------------------------
 * * GET:        /comments/bypostid/:postId          - Get comments by postId
 * * GET:        /comments/all                       - Get all comments
 * * GET:        /comments/:id                       - Get a comment by id
 * * POST:       /comments                           - Creates a comment
 * * PUT:        /comments                           - Updates a comment
 * * DELETE:     /comments/:id                       - Deletes a comment by id
 */

import asyncHandler from 'express-async-handler'
import { cacher } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'

import CommentRepository from '../repositories/comment_repository'

import CreateCommentDTO from '../dtos/comment/CreateCommentDTO'
import CommentDTO from '../dtos/comment/CommentDTO'
import UpdateCommentDTO from '../dtos/comment/UpdateCommentDTO'

import type { Request, Response } from 'express'
import { CreateCommentReqBody, UpdateCommentReqBody } from '../types/comment'

const commentRepo = new CommentRepository()

/**
 * * Creates a post comment in database.
 * * REQUEST: POST - text, postId, userId - Body
 * * RESPONSE: 201 Created with Location - Json - Comment
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const createComment = asyncHandler(async (req: Request, res: Response) => {
    const { text, postId, userId } : CreateCommentReqBody = req.body
    const createCommentDTO = new CreateCommentDTO(text, postId, userId)
    const comment = await commentRepo.createComment(createCommentDTO)
    const commentJson = comment.toObject()
    status201CreatedWithLocation(res, `${apiUrls.comments}/${commentJson.id}`).json(commentJson)
})

/**
 * * Fetches comments that belongs to a post from database or cache.
 * * REQUEST: GET - postId - Path
 * * RESPONSE: 200 OK - Json - Comment[]
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const getComments = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.postId as string
    
    const chacheKey = 'comments-' + postId
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const commentsData = await commentRepo.getComments(postId)
        const comments = commentsData.map((c: CommentDTO) => c.toObject())
        cacher.set(chacheKey, comments, 300)
        status200Ok(res).json(comments)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Fetches all comments from database or cache.
 * * REQUEST: GET
 * * RESPONSE: 200 OK - Json - Comment[]
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getAllComments = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'all_comments'
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const commentsData = await commentRepo.getAllComments()
        const comments = commentsData.map((c: CommentDTO) => c.toObject())
        cacher.set(chacheKey, comments, 300)
        status200Ok(res).json(comments)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Fetches a comment by id from database or cache.
 * * REQUEST: GET - id - Path
 * * RESPONSE: 200 OK - Json - Comment
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const getComment = asyncHandler(async (req: Request, res: Response) => {
    const chacheKey = 'comment-' + req.params.id
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const id: string = req.params.id

        try {
            const commentData = await commentRepo.getComment(id)
            const comment = commentData.toObject()
            cacher.set(chacheKey, comment, 300)
            status200Ok(res).json(comment)
        } catch (err) {
            throw new ApiError(404, 'Comment not found with given id')
        }
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Deletes a comment by id from database.
 * * REQUEST: DELETE - id - Path
 * * RESPONSE: 204 No content
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 404 Not found
 * @throws 500 Internal server error
 */
const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const id: string = req.params.id

    try {
        await commentRepo.deleteComment(id)
        status204NoContent(res)
    } catch (err) {
        throw new ApiError(404, 'Comment not found with given id')
    }
})

/**
 * * Updates a comment by id from database.
 * * REQUEST: PUT - id, text - Body
 * * RESPONSE: 204 No content
 * @throws 401 Unauthorized
 * @throws 400 Bad request
 * @throws 500 Internal server error
 */
const updateComment = asyncHandler(async (req: Request, res: Response) => {
    const { id, text } : UpdateCommentReqBody = req.body
    const updateCommentDTO = new UpdateCommentDTO(id, text)
    await commentRepo.updateComment(updateCommentDTO)
    status204NoContent(res)
})

export {
    getComments,
    getAllComments,
    getComment,
    createComment,
    updateComment,
    deleteComment
}