/**
 * @module
 * @class GuestBookmarkDTO
 * To use the fetched guest bookmark object from database.
 */

import PostDTO from "../post/PostDTO"
import CreateGuestBookmarkDTO from "./CreateGuestBookmarkDTO"
import { param, query } from 'express-validator'

export default class GuestBookmarkDTO extends CreateGuestBookmarkDTO {
    protected _id: string
    protected _post?: PostDTO

    constructor(id: string, postId: string, guestId: string, post?: PostDTO)
    {
        super(postId, guestId)

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
            param('guestId')
                .isString()
                .notEmpty().withMessage('Guest id cannot be empty')
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
            query('guestId')
                .isString()
                .trim()
                .notEmpty().withMessage('Guest id cannot be empty')
                .escape(),
        ]
    }

    static fromDB(bookmark: any) : GuestBookmarkDTO {
        return new GuestBookmarkDTO(
            bookmark.id,
            bookmark.postId,
            bookmark.guestId,
            bookmark.post
        )
    }

    toObject() {
        return {
            id: this.id,
            postId: this.postId,
            guestId: this.guestId,
            post: this.post
        }
    }
}