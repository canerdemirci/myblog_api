/**
 * @module CreateNoteInteractionDTO
 * Used to create note interactions in database.
 */

import { InteractionType, Role } from '@prisma/client'
import { body } from 'express-validator'

export default class CreateNoteInteractionDTO {
    protected _role: Role
    protected _type: InteractionType
    protected _noteId: string
    protected _guestId?: string
    protected _userId?: string

    constructor(role: Role, type: InteractionType, noteId: string,
        guestId?: string, userId?: string)
    {
        this._role = role
        this._type = type
        this._noteId = noteId
        this._guestId = guestId
        this._userId = userId
    }

    get role() {
        return this._role
    }

    get type() {
        return this._type
    }

    get noteId() {
        return this._noteId
    }

    get guestId() {
        return this._guestId
    }

    get userId() {
        return this._userId
    }

    static validationAndSanitizationSchema() {
        return [
            body('role')
                .isString()
                .notEmpty().withMessage('Role cannot be empty')
                .trim()
                .escape(),
            body('type')
                .isString()
                .notEmpty().withMessage('Interaction type cannot be empty')
                .trim()
                .escape(),
            body('noteId')
                .isString()
                .notEmpty().withMessage('Note Id cannot be empty.')
                .trim()
                .escape(),
            body('guestId')
                .optional({values: 'falsy'})
                .isString()
                .trim(),
            body('userId')
                .optional({values: 'falsy'})
                .isString()
                .trim(),
        ]
    }
}