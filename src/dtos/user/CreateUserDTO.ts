/**
 * @module
 * @class CreateUserDTO
 * Used to create user in database.
 */

import { body } from 'express-validator'

export default class CreateUserDTO {
    protected _email: string
    protected _name?: string
    protected _image?: string
    protected _password?: string
    protected _provider?: string
    protected _providerId?: string

    constructor(
        email: string, 
        name?: string, image?: string, password?: string, provider?: string, providerId?: string
    ) {
        this._email = email
        this._name = name
        this._image = image
        this._password = password
        this._provider = provider
        this._providerId = providerId
    }

    get email() {
        return this._email
    }

    get name() {
        return this._name
    }

    get image() {
        return this._image
    }

    get password() {
        return this._password
    }

    get provider() {
        return this._provider
    }

    get providerId() {
        return this._providerId
    }
    
    static validationAndSanitizationSchema() {
        return [
            body('email')
                .isString()
                .notEmpty().withMessage('Email cannot be empty.')
                .isEmail()
                .isLength({max: 320}).withMessage('Email cannot be more than 320 character long.')
                .trim()
                .escape(),
            body('name')
                .optional({values: 'falsy'})
                .isString()
                .trim()
                .escape(),
            body('image')
                .optional({values: 'falsy'})
                .isURL()
                .trim(),
            body('password')
                .optional({values: 'falsy'})
                .isString()
                .isLength({max: 50}).withMessage('Password cannot be more than 50 characters long.')
                .isStrongPassword({
                    minLength: 10,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1,
                    pointsForContainingLower: undefined,
                    pointsForContainingNumber: undefined,
                    pointsForContainingSymbol: undefined,
                    pointsForContainingUpper: undefined,
                    pointsPerRepeat: undefined,
                    pointsPerUnique: undefined,
                    returnScore: undefined
                })
                .trim()
                .escape(),
            body('provider')
                .optional({values: 'falsy'})
                .isString()
                .trim()
                .escape(),
            body('providerId')
                .optional({values: 'falsy'})
                .isString()
                .trim()
                .escape(),
        ]
    }
}