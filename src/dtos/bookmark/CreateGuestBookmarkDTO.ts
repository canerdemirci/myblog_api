/**
 * @module CreateGuestBookmarkDTO
 * Used to create guest bookmark in database.
 */

import { Role } from '@prisma/client'
import { body } from 'express-validator'
import CreateBookmarkDTO from './CreateBookmarkDTO'

export default class CreateGuestBookmarkDTO extends CreateBookmarkDTO {
    protected _postId: string
    protected _guestId: string

    constructor(postId: string, guestId: string) {
        super(Role.GUEST, postId, guestId, undefined)
        this._postId = postId
        this._guestId = guestId
    }

    static validationAndSanitizationSchema() {
        return [
            body('postId')
                .isString()
                .notEmpty().withMessage('Post id is required.')
                .trim()
                .escape(),
            body('guestId')
                .isString()
                .notEmpty().withMessage('Guest id is required')
                .trim()
                .escape(),
        ]
    }
}