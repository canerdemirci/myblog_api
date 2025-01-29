/**
 * @module CreateNoteDTO
 * Used to create note in database.
 */

import { body } from 'express-validator'

export default class CreateNoteDTO {
    protected _content: string
    protected _images: string[]

    constructor(content: string, images: string[]) {
        this._content = content
        this._images = images
    }

    get content() {
        return this._content
    }

    get images() {
        return this._images
    }

    static validationAndSanitizationSchema() {
        return [
            body('content')
                .trim()
                .isString(),
            body('images')
                .isArray().withMessage('Image array is required wheter is empty or not.'),
            body('images.*')
                .trim()
                .escape(),
        ]
    }
}