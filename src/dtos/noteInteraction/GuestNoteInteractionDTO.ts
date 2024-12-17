/**
 * @module GuestNoteInteractionDTO
 * To use the fetched note interaction belongs the guest object from database.
 */

import { InteractionType, Role } from "@prisma/client"
import CreateNoteInteractionDTO from "./CreateNoteInteractionDTO"
import { param, query } from 'express-validator'

export default class GuestNoteInteractionDTO extends CreateNoteInteractionDTO {
    protected _id: string
    protected _role: Role

    constructor(id: string, type: InteractionType, noteId: string,
        guestId: string)
    {
        super('GUEST', type, noteId, guestId, undefined)

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
            query('noteId')
                .isString()
                .notEmpty().withMessage('Note Id cannot be empty.')
                .trim()
                .escape(),
            query('guestId')
                .isString()
                .notEmpty().withMessage('Guest Id cannot be empty.')
                .trim()
                .escape(),
        ]
    }

    static fromDB(interaction: any) : GuestNoteInteractionDTO {
        return new GuestNoteInteractionDTO(
            interaction.id,
            interaction.type,
            interaction.noteId,
            interaction.guestId,
        )
    }

    toObject() {
        return {
            id: this.id,
            role: Role.GUEST,
            type: this.type,
            noteId: this.noteId,
            guestId: this.guestId,
        }
    }
}