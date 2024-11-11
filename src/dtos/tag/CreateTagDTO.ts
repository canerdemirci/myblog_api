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
                .notEmpty().withMessage('Etiket adı boş bırakılamaz.')
                .isLength({max: 100}).withMessage('Etiket adı en fazla 100 karakter olabilir.')
                .trim()
                .escape(),
        ]
    }
}