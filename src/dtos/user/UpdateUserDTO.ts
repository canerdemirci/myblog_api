import { body } from "express-validator"

/**
 * @module UpdateUserDTO
 * Used to update user in database.
 */
export default class UpdatePostDTO {
    protected _id: string
    protected _name?: string
    protected _image?: string

    constructor(id: string, name?: string, image?: string) {
        this._id = id
        this._name = name
        this._image = image
    }

    get id() {
        return this._id
    }

    get name() {
        return this._name
    }

    get image() {
        return this._image
    }

    static validationAndSanitizationSchema() {
        return [
            body('name')
                .optional({values: 'falsy'})
                .isString()
                .trim()
                .escape(),
            body('image')
                .optional({values: 'falsy'})
                .isString()
                .trim()
        ]
    }
}