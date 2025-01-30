/**
 * @module
 * @class CommentRepository
 * This repository used for crud operations at comments.
 */

import prismaClient from "../utils/prismaClient"

import CreateCommentDTO from "../dtos/comment/CreateCommentDTO"
import CommentDTO from "../dtos/comment/CommentDTO"
import UpdateCommentDTO from "../dtos/comment/UpdateCommentDTO"

export default class CommentRepository {
    /**
     * Creates a comment with related post and user.
     * @param createCommentDTO CreateCommentDTO
     * @throws Error
     * @returns Promise < CommentDTO >
     */
    async createComment(createCommentDTO: CreateCommentDTO) : Promise<CommentDTO> {
        const comment = await prismaClient.comment.create({
            data: {
                text: createCommentDTO.text,
                postId: createCommentDTO.postId,
                userId: createCommentDTO.userId,
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        image: true
                    }
                }
            },
        })

        return CommentDTO.fromDB(comment)
    }

    /**
     * Fetches all comments belongs to a post with some of their owner (user) infos.
     * @param postId string
     * @throws Error
     * @returns Promise < CommentDTO[] >
     */
    async getComments(postId: string) : Promise<CommentDTO[]> {
        const comments = await prismaClient.comment.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        image: true
                    }
                }
            },
            where: {
                postId: postId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return comments.map(c => CommentDTO.fromDB(c))
    }

    /**
     * Fetches all comments with some of their owner (user) infos.
     * @throws Error
     * @returns Promise < CommentDTO[] >
     */
    async getAllComments() : Promise<CommentDTO[]> {
        const comments = await prismaClient.comment.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        image: true
                    }
                },
                post: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return comments.map(c => CommentDTO.fromDB(c))
    }

    /**
     * Fetches a comment by id.
     * @param id string
     * @throws Error
     * @returns Promise < CommentDTO >
     */
    async getComment(id: string) : Promise<CommentDTO> {
        const comment = await prismaClient.comment.findFirstOrThrow({ where: { id: id } })
        
        return CommentDTO.fromDB(comment)
    }

    /**
     * Deletes a comment by id.
     * @param id string
     * @throws Error
     * @returns Promise < void >
     */
    async deleteComment(id: string) : Promise<void> {
        await prismaClient.comment.delete({ where: { id: id } })
    }

    /**
     * Updates the comment.
     * @param newComment UpdateCommentDTO
     * @throws Error
     * @returns Promise < void >
     */
    async updateComment(newComment: UpdateCommentDTO) : Promise<void> {
        await prismaClient.comment.update({
            where: { id: newComment.id },
            data: {
                text: newComment.text,
            }
        })
    }
}