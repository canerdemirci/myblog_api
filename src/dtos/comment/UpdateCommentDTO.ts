/**
 * @module UpdateCommentDTO
 * Used to update comment in database.
 */

import CreateCommentDTO from "./CreateCommentDTO"
import { body } from 'express-validator'

export default class UpdateCommentDTO extends CreateCommentDTO {
    protected _id: string

    constructor(id: string, text: string, postId: string, userId: string) {
        super(text, postId, userId)
        this._id = id
    }

    get id() {
        return this._id
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