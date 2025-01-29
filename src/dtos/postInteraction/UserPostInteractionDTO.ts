/**
 * @module UserPostInteractionDTO
 * To use the fetched post interaction belongs the guest object from database.
 */

import { InteractionType, Role } from "@prisma/client"
import { param, query } from 'express-validator'
import CreatePostInteractionDTO from "./CreatePostInteractionDTO"

export default class UserPostInteractionDTO extends CreatePostInteractionDTO {
    protected _id: string
    protected _role: Role

    constructor(id: string, type: InteractionType, postId: string,
        userId: string)
    {
        super('USER', type, postId, undefined, userId)

        this._id = id
        this._role = 'USER'
    }

    get id() {
        return this._id
    }

    get role() {
        return this._role
    }

    static validationAndSanitizationSchema() {
        return [
            param('id')
                .isString()
                .trim()
                .notEmpty()
                .escape()
        ]
    }

    static validationAndSanitizationSchema2() {
        return [
            query('type')
                .isString()
                .trim()
                .notEmpty().withMessage('Type cannot be empty.')
                .escape(),
            query('postId')
                .isString()
                .trim()
                .notEmpty().withMessage('Post Id cannot be empty.')
                .escape(),
            query('userId')
                .isString()
                .trim()
                .notEmpty().withMessage('User Id cannot be empty.')
                .escape(),
        ]
    }

    static fromDB(interaction: any) : UserPostInteractionDTO {
        return new UserPostInteractionDTO(
            interaction.id,
            interaction.type,
            interaction.postId,
            interaction.userId,
        )
    }

    toObject() {
        return {
            id: this.id,
            role: Role.USER,
            type: this.type,
            postId: this.postId,
            userId: this.userId,
        }
    }
}