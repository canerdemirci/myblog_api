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
                .notEmpty().withMessage('Id boş bırakılamaz.')
                .trim()
                .escape(),
            body('title')
                .isString()
                .notEmpty().withMessage('Makale başlığı boş bırakılamaz.')
                .isLength({max: 255}).withMessage('Makale başlığı en fazla 250 karakter olabilir.')
                .trim()
                .escape(),
            body('content')
                .optional({values: 'falsy'})
                .isString(),
            body('cover')
                .optional({values: 'falsy'})
                .isString()
                .trim()
                .escape(),
        ]
    }
}