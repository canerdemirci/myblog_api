/**
 * @module
 * @class UpdateCommentDTO
 * Used to update comment in database.
 */

import { body } from 'express-validator'

export default class UpdateCommentDTO {
    protected _id: string
    protected _text: string

    constructor(id: string, text: string) {
        this._id = id
        this._text = text
    }

    get id() {
        return this._id
    }

    get text() {
        return this._text
    }

    static validationAndSanitizationSchema() {
        return [
            body('id')
                .isString()
                .notEmpty().withMessage('Comment id is required')
                .trim()
                .escape(),
            body('text')
                .isString()
                .notEmpty().withMessage('Comment text cannot be empty')
                .isLength({max: 500, min: 5}).withMessage('Comment text can be 500 character long.')
                .trim()
                .escape(),
        ]
    }
}