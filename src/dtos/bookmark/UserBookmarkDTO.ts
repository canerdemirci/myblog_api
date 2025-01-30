/**
 * @module
 * @class UserBookmarkDTO
 * To use the fetched user bookmark object from database.
 */

import PostDTO from "../post/PostDTO"
import CreateUserBookmarkDTO from "./CreateUserBookmarkDTO"
import { param, query } from 'express-validator'

export default class UserBookmarkDTO extends CreateUserBookmarkDTO {
    protected _id: string
    protected _post?: PostDTO

    constructor(id: string, postId: string, userId: string, post?: PostDTO)
    {
        super(postId, userId)

        this._id = id
        this._post = post
    }

    get id() {
        return this._id
    }

    get post() {
        return this._post
    }

    static validationAndSanitizationSchema() {
        return [
            param('userId')
                .isString()
                .notEmpty().withMessage('User id cannot be empty')
                .trim()
                .escape(),
        ]
    }

    static validationAndSanitizationSchema2() {
        return [
            query('postId')
                .isString()
                .trim()
                .notEmpty().withMessage('Post id cannot be empty')
                .escape(),
            query('userId')
                .isString()
                .trim()
                .notEmpty().withMessage('User id cannot be empty')
                .escape(),
        ]
    }

    static fromDB(bookmark: any) : UserBookmarkDTO {
        return new UserBookmarkDTO(
            bookmark.id,
            bookmark.postId,
            bookmark.userId,
            bookmark.post
        )
    }

    toObject() {
        return {
            id: this.id,
            postId: this.postId,
            userId: this.userId,
            post: this.post
        }
    }
}