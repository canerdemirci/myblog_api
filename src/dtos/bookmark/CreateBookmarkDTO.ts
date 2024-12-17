/**
 * @module CreateBookmarkDTO
 * Used to create bookmark in database.
 */

import { Role } from '@prisma/client'
import { body } from 'express-validator'

export default class CreateBookmarkDTO {
    protected _role: Role
    protected _postId: string
    protected _guestId?: string
    protected _userId?: string

    constructor(role: Role, postId: string, guestId?: string, userId?: string) {
        this._role = role
        this._postId = postId
        this._guestId = guestId
        this._userId = userId
    }

    get role() {
        return this._role
    }

    get postId() {
        return this._postId
    }

    get guestId() {
        return this._guestId
    }

    get userId() {
        return this._userId
    }

    static validationAndSanitizationSchema() {
        return [
            body('role')
                .isString()
                .notEmpty().withMessage('Role is required.')
                .trim()
                .escape(),
            body('postId')
                .isString()
                .notEmpty().withMessage('Post id is required.')
                .trim()
                .escape(),
            body('guestId')
                .optional({values: 'falsy'})
                .isString()
                .trim(),
            body('userId')
                .optional({values: 'falsy'})
                .isString()
                .trim(),
        ]
    }
}