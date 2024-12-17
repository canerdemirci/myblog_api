/**
 * @module CreateNoteDTO
 * Used to create note in database.
 */

import { body } from 'express-validator'

export default class CreateNoteDTO {
    protected _content: string

    constructor(content: string) {
        this._content = content
    }

    get content() {
        return this._content
    }

    static validationAndSanitizationSchema() {
        return [
            body('content')
                .trim()
                .isString(),
        ]
    }
}