/**
 * @module CreateUserNoteInteractionDTO
 * Used to create user note interactions in database.
 */

import { InteractionType, Role } from '@prisma/client'
import CreateNoteInteractionDTO from './CreateNoteInteractionDTO'
import { body } from 'express-validator'

export default class CreateUserNoteInteractionDTO extends CreateNoteInteractionDTO {
    constructor(type: InteractionType, noteId: string, userId: string) {
        super(Role.USER, type, noteId, undefined, userId)
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
            body('userId')
                .isString()
                .notEmpty().withMessage('userId cannot be empty.')
                .trim()
                .escape()
        ]
    }
}