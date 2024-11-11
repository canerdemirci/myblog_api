/**
 * @module CreatePostDTO
 * Used to create post in database.
 */

import { body } from 'express-validator'

export default class CreatePostDTO {
    protected _title: string
    protected _content?: string
    protected _cover?: string

    constructor(title: string, content?: string, cover?: string) {
        this._title = title
        this._content = content
        this._cover = cover
    }

    get title() {
        return this._title
    }

    get content() {
        return this._content
    }

    get cover() {
        return this._cover
    }

    static validationAndSanitizationSchema() {
        return [
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
            body('tags.*')
                .isString()
                .notEmpty().withMessage('Etiket adı boş bırakılamaz.')
                .isLength({max: 100}).withMessage('Etiket adı en fazla 100 karakter olabilir.')
                .trim()
                .escape(),
        ]
    }
}