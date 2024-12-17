/**
 * @module CreateTagDTO
 * Used to create tag in database.
 */

import { body } from 'express-validator'

export default class CreateTagDTO {
    protected _name: string

    constructor(name: string) {
        this._name = name
    }

    get name() {
        return this._name
    }
    
    static validationAndSanitizationSchema() {
        return [
            body('name')
                .isString()
                .notEmpty().withMessage('Tag name cannot be empty.')
                .isLength({max: 100}).withMessage('Tag name can be 100 character long.')
                .trim()
                .escape(),
        ]
    }
}