/**
 * @module UserNoteInteractionDTO
 * To use the fetched note interaction belongs the guest object from database.
 */

import { InteractionType, Role } from "@prisma/client"
import CreateNoteInteractionDTO from "./CreateNoteInteractionDTO"
import { param, query } from 'express-validator'

export default class UserNoteInteractionDTO extends CreateNoteInteractionDTO {
    protected _id: string
    protected _role: Role

    constructor(id: string, type: InteractionType, noteId: string,
        userId: string)
    {
        super('USER', type, noteId, undefined, userId)

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
        return [param('id').escape()]
    }

    static validationAndSanitizationSchema2() {
        return [
            query('type')
                .isString()
                .notEmpty().withMessage('Type cannot be empty.')
                .trim()
                .escape(),
            query('noteId')
                .isString()
                .notEmpty().withMessage('Note Id cannot be empty.')
                .trim()
                .escape(),
            query('userId')
                .isString()
                .notEmpty().withMessage('User Id cannot be empty.')
                .trim()
                .escape(),
        ]
    }

    static fromDB(interaction: any) : UserNoteInteractionDTO {
        return new UserNoteInteractionDTO(
            interaction.id,
            interaction.type,
            interaction.noteId,
            interaction.userId,
        )
    }

    toObject() {
        return {
            id: this.id,
            role: Role.USER,
            type: this.type,
            noteId: this.noteId,
            userId: this.userId,
        }
    }
}