/**
 * @module CreateGuestNoteInteractionDTO
 * Used to create note interactions in database.
 */

import { InteractionType, Role } from '@prisma/client'
import CreateNoteInteractionDTO from './CreateNoteInteractionDTO'
import { body } from 'express-validator'

export default class CreateGuestNoteInteractionDTO extends CreateNoteInteractionDTO {
    protected _requesterIp: string

    constructor(type: InteractionType, noteId: string, guestId: string, requesterIp: string) {
        super(Role.GUEST, type, noteId, guestId + '-' + requesterIp, undefined)

        this._requesterIp = requesterIp
    }

    get requesterIp() {
        return this._requesterIp
    }

    static validationAndSanitizationSchema() {
        return [
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
                .isString()
                .notEmpty().withMessage('guestId cannot be empty.')
                .trim()
                .escape()
        ]
    }
}