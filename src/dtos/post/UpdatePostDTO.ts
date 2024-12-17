/**
 * @module UpdatePostDTO
 * Used to update post in database.
 */

import CreatePostDTO from "./CreatePostDTO"
import { body } from 'express-validator'

export default class UpdatePostDTO extends CreatePostDTO {
    protected _id: string

    constructor(id: string, title: string, content?: string, cover?: string) {
        super(title, content, cover)
        this._id = id
    }

    get id() {
        return this._id
    }

    static validationAndSanitizationSchema() {
        return [
            body('id')
                .isString()
                .notEmpty().withMessage('Id cannot be empty.')
                .trim()
                .escape(),
            body('title')
                .isString()
                .notEmpty().withMessage('Article title cannot be empty')
                .isLength({max: 255}).withMessage('Article title can be 255 character long.')
                .trim()
                .escape(),
            body('content')
                .optional({values: 'falsy'})
                .isString()
                .trim(),
            body('cover')
                .optional({values: 'falsy'})
                .isString()
                .trim()
                .escape(),
        ]
    }
}