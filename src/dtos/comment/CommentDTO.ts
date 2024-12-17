/**
 * @module CommentDTO
 * To use the fetched comment object from database.
 */

import PostDTO from "../post/PostDTO"
import CommentUserDTO from "./CommentUserDTO"
import CreateCommentDTO from "./CreateCommentDTO"
import { param } from 'express-validator'

function dateString(date: Date) : string {
    const pieces = date.toLocaleDateString().split('/')
    return [pieces[1], pieces[0], pieces[2]].join('.')
}

export default class CommentDTO extends CreateCommentDTO {
    protected _id: string
    protected _createdAt: Date
    protected _updatedAt: Date
    protected _user?: CommentUserDTO
    protected _post?: PostDTO

    constructor(id: string, text: string, postId: string, userId: string,
        createdAt: Date, updatedAt: Date, user?: CommentUserDTO, post?: PostDTO)
    {
        super(text, postId, userId)

        this._id = id
        this._createdAt = createdAt
        this._updatedAt = updatedAt
        this._user = user
        this._post = post
    }

    get id() {
        return this._id
    }

    get createdAt() {
        return this._createdAt
    }

    get updatedAt() {
        return this._updatedAt
    }

    get user() {
        return this._user
    }

    get post() {
        return this._post
    }

    static validationAndSanitizationSchema() {
        return [param('id').escape()]
    }

    static validationAndSanitizationSchema2() {
        return [
            param('postId')
                .isString()
                .notEmpty().withMessage('Post id cannot be empty')
                .trim()
                .escape(),
        ]
    }

    static fromDB(comment: any) : CommentDTO {
        return new CommentDTO(
            comment.id,
            comment.text,
            comment.postId,
            comment.userId,
            comment.createdAt,
            comment.updatedAt,
            comment.user,
            comment.post
        )
    }

    toObject() {
        return {
            id: this.id,
            createdAt: dateString(this.createdAt),
            updatedAt: dateString(this.updatedAt),
            text: this.text,
            postId: this.postId,
            userId: this.userId,
            user: this.user,
            post: this.post
        }
    }
}