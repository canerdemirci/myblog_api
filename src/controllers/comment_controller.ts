/**
 * @module commentController
 * Get comments, get a comment, create a comment, update a comment, delete a comment.
 * Sanitizing, Validation and Error handling happens in middlewares and routers.
 */

import type { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { cacher } from '../utils/cacher'
import { apiUrls } from '../constants'
import { status200Ok, status201CreatedWithLocation, status204NoContent } from './responses'
import { ApiError } from '../middleware/error'
import CommentRepository from '../repositories/comment_repository'
import CreateCommentDTO from '../dtos/comment/CreateCommentDTO'
import CommentDTO from '../dtos/comment/CommentDTO'
import UpdateCommentDTO from '../dtos/comment/UpdateCommentDTO'

const commentRepo = new CommentRepository()

/**
 * * Acquires From REQUEST BODY: text, postId, userId.
 * * Creates a Comment with CreateCommentDTO.
 * * Converts the Comment to Object
 * * SENDS: Comment json - 201 Created - With location
 * 
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const createComment = asyncHandler(async (req: Request, res: Response) => {
    const { text, postId, userId } : 
        { text: string, postId: string, userId: string } = req.body
    const createCommentDTO = 
        new CreateCommentDTO(text, postId, userId)
    const comment = await commentRepo.createComment(createCommentDTO)
    const commentJson = comment.toObject()
    status201CreatedWithLocation(res, `${apiUrls.comments}/${commentJson.id}`).json(commentJson)
})

/**
 * * Acquires from REQUEST QUERY: postId
 * * Fetches all comments by postId from database or chache
 * * SENDS: Comment[] json - 200 OK
 * @throws 401 Unauthorized
 * @throws 500 Internal server error
 */
const getComments = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.postId as string
    
    const chacheKey = 'comments-' + postId
    const chacedData = cacher.get(chacheKey)

    if (!chacedData) {
        const commentsData = await commentRepo.getComments(postId)
        const comments = commentsData.map((c: CommentDTO) => c.toObject())
        status200Ok(res).json(comments)
        cacher.set(chacheKey, comments, 300)
    } else {
        status200Ok(res).json(chacedData)
    }
})

/**
 * * Fetches all comments from database or chache
 * * SENDS: Comment[] json - 200 OK
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
 * * Acquires from REQUEST PARAMS: id
 * * Fetches a comment by id from database or chache
 * * SENDS: Comment json - 200 OK
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
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
 * * Acquires from REQUEST PARAMS: id
 * * Deletes a comment from database by id
 * * SENDS: 204 No Content
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
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
 * * Acquires from REQUEST BODY: id, text, postId, userId.
 * * Updates a Comment with UpdateCommentDTO.
 * * SENDS: 204 No Content
 * @throws 401 Unauthorized
 * @throws 400 Bad request - Validation error
 * @throws 500 Internal server error
 */
const updateComment = asyncHandler(async (req: Request, res: Response) => {
    const { id, text } : 
        { id: string, text: string } = req.body
    const updateCommentDTO = new UpdateCommentDTO(id, text)
    await commentRepo.updateComment(updateCommentDTO)
    status204NoContent(res)
})

export {
    createComment,
    getComment,
    getComments,
    getAllComments,
    updateComment,
    deleteComment
}