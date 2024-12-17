/**
 * @module UserDTO
 * To use the fetched user object from database.
 */

import CreateUserDTO from "./CreateUserDTO"
import { param, query } from 'express-validator'

export default class UserDTO extends CreateUserDTO {
    protected _id: string
    protected _createdAt: Date
    protected _updatedAt: Date

    constructor(
        id: string, email: string, createdAt: Date, updatedAt: Date,
        name?: string, image?: string, password?: string, provider?: string, providerId?: string
    ) {
        super(email, name, image, password, provider, providerId)

        this._id = id
        this._createdAt = createdAt
        this._updatedAt = updatedAt
    }

    get id() {
        return this._id
    }

    get createdAt() {
        return this._createdAt
    }

    get updatedAt() {
        return this._updatedAt
    }

    static validationAndSanitizationSchema() {
        return [param('id').escape()]
    }

    static validationAndSanitizationSchema3() {
        return [param('providerId').escape()]
    }

    static validationAndSanitizationSchema2() {
        return [
            query('email')
                .isString()
                .notEmpty().withMessage('Email cannot be empty.')
                .trim()
                .escape(),
            query('password')
                .isString()
                .notEmpty().withMessage('Password cannot be empty')
                .trim()
                .escape(),
        ]
    }

    static fromDB(user: any) : UserDTO {
        return new UserDTO(
            user.id,
            user.email,
            user.createdAt,
            user.updatedAt,
            user.name,
            user.image,
            user.password,
            user.provider,
            user.providerId
        )
    }

    toObject() {
        return {
            id: this.id,
            email: this.email,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            name: this.name,
            image: this.image,
            password: this.password,
            provider: this.provider,
            providerId: this.providerId
        }
    }
}