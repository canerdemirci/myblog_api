/**
 * @module GuestPostInteractionDTO
 * To use the fetched post interaction belongs the guest object from database.
 */

import { InteractionType, Role } from "@prisma/client"
import { param, query } from 'express-validator'
import CreatePostInteractionDTO from "./CreatePostInteractionDTO"

export default class GuestPostInteractionDTO extends CreatePostInteractionDTO {
    protected _id: string
    protected _role: Role

    constructor(id: string, type: InteractionType, postId: string,
        guestId: string)
    {
        super('GUEST', type, postId, guestId, undefined)

        this._id = id
        this._role = 'GUEST'
    }

    get id() {
        return this._id
    }

    get role() {
        return this._role
    }

    static validationAndSanitizationSchema() {
        return [param('id').escape()]
    }

    static validationAndSanitizationSchema2() {
        return [
            query('type')
                .isString()
                .notEmpty().withMessage('Type cannot be empty.')
                .trim()
                .escape(),
            query('postId')
                .isString()
                .notEmpty().withMessage('Post Id cannot be empty.')
                .trim()
                .escape(),
            query('guestId')
                .isString()
                .notEmpty().withMessage('Guest Id cannot be empty.')
                .trim()
                .escape(),
        ]
    }

    static fromDB(interaction: any) : GuestPostInteractionDTO {
        return new GuestPostInteractionDTO(
            interaction.id,
            interaction.type,
            interaction.postId,
            interaction.guestId,
        )
    }

    toObject() {
        return {
            id: this.id,
            role: Role.GUEST,
            type: this.type,
            postId: this.postId,
            guestId: this.guestId,
        }
    }
}