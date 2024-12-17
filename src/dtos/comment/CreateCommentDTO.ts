/**
 * @module CreateCommentDTO
 * Used to create post comments in database.
 */

import { body } from 'express-validator'

export default class CreateCommentDTO {
    protected _text: string
    protected _postId: string
    protected _userId: string

    constructor(text: string, postId: string, userId: string) {
        this._text = text
        this._postId = postId
        this._userId = userId
    }

    get text() {
        return this._text
    }

    get postId() {
        return this._postId
    }

    get userId() {
        return this._userId
    }

    static validationAndSanitizationSchema() {
        return [
            body('text')
                .isString()
                .notEmpty().withMessage('Comment text cannot be empty')
                .isLength({min: 5, max: 500}).withMessage('Comment text can be 500 character long')
                .trim()
                .escape(),
            body('postId')
                .isString()
                .notEmpty().withMessage('Post id is required.')
                .trim()
                .escape(),
            body('userId')
                .isString()
                .notEmpty().withMessage('User id is required')
                .trim()
                .escape()
        ]
    }
}