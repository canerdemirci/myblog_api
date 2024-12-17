/**
 * @module CreateUserBookmarkDTO
 * Used to create user bookmark in database.
 */

import { Role } from '@prisma/client'
import { body } from 'express-validator'
import CreateBookmarkDTO from './CreateBookmarkDTO'

export default class CreateUserBookmarkDTO extends CreateBookmarkDTO {
    protected _postId: string
    protected _userId: string

    constructor(postId: string, userId: string) {
        super(Role.USER, postId, undefined, userId)
        this._postId = postId
        this._userId = userId
    }

    static validationAndSanitizationSchema() {
        return [
            body('postId')
                .isString()
                .notEmpty().withMessage('Post id is required.')
                .trim()
                .escape(),
            body('userId')
                .isString()
                .notEmpty().withMessage('User id is required')
                .trim()
                .escape(),
        ]
    }
}